const { Room } = require("colyseus");
const em = require('exact-math');
var jwt = require('jsonwebtoken');
var setting = require('../../config/settings');
const knex = require('../../config/database');
const { Customer, User, hiloHistory, hiloChat, hiloGame, hiloBetting } = require('../models')
const { limit, random, toggle, get_balance, deposit, whitdraw, rollback } = require('../helpers/game_helper');
const cardNumber = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const cardType = ['h', 'd', 's', 'c'];

const loRatio = [1.09, 1.2, 1.33, 1.5, 1.7, 2, 2.4, 3, 4, 6, 1.8, 12, 0];
const hiRatio = [0, 12, 6, 4.8, 4, 3, 2.4, 2, 1.7, 1.5, 1.33, 1.2, 1.9];
const customers = {};
class State {
    constructor() {
        this.players = [];
        this.ratio = {};
        this.games = [];
        this.started = false;
        this.card = '';
    }
}

class ServerHilo extends Room {
    onCreate(options) {
        this.card = [];
        this.gameId = 0;
        this.setState(new State());
        this.getChats();
        this.getCustomer();
        this.getGames();
        this.clock.setTimeout(() => {
            this.start();
        }, 1000);
        this.onMessage("*", (client, type, message) => {
            this.receive(client, type, message);
        });
    }

    async onAuth(client, { token }, req) {
        let { id } = jwt.verify(token, setting.privateKey);
        const user = await User.findOne({ id });
        if (user) {
            client.userId = user.id;
            client.xref = { id: user.ref, user: user.ref_id }
            client.username = user.username;
            client.balance = user.balance;
            client.state = user.state;
            return true;
        }
        return false;
    }

    onJoin(client, options, auth) {
        this.clock.setTimeout(() => {
            this.updateUser(client)
        }, 1000);
    }

    receive(client, type, message) {
        switch (type) {
            case 'chat':
                this.setChat(client, message);
                break;
            case 'bet':
                if (this.state.players.find(e => e.userId == client.userId))
                    this.resetBet(client, message);
                else
                    this.setBet(client, message);
                break;
        }
    }
    getCustomer() {
        Customer.findAll()
            .then(css => {
                for (let cs of css) {
                    customers[cs.id] = { callback: cs.callback, secret: cs.key }
                }
            })
    }
    async resetBet(client, { bet }) {
        const ref = this.ref(client.xref);
        const balance = await rollback(client.userId, { ...ref, tid: this.gameId, amount: bet });
        if (balance) {
            client.balace = balance;
        }
        var idx = arr.findIndex(e => e.userId == client.userId);
        if (idx !== -1) {
            this.state.players.splice(idx, 1);
        }
        this.setBetting(client, bet, false);
        client.send('beted', res);
    }
    async setBet(client, { bet, type }) {
        const ref = this.ref(client.xref);
        const balance = await deposit(client.userId, { ...ref, tid: this.gameId, amount: bet });
        if (balance < bet || !balance) {
            client.send('error', 'balance-error');
            return;
        }
        client.balace = balance;
        this.state.players.unshift({
            userId: client.userId,
            user: client.username,
            ref: client.xref,
            type: type,
            bet: bet,
            status: null
        })
        this.setBetting(client, bet, true);
        client.send('beted', true);
    }
    start(first = true) {
        this.state.players = [];
        this.dispatchCard(first);
        this.clock.setTimeout(() => {
            this.checkResult();
        }, 10000);
    }
    getGames() {
        hiloGame.get(10)
            .then(games => {
                this.state.games = games;
            })
    }
    getChats() {
        knex
            .select([
                ...['id', 'user_id', 'text', 'created_at'].map(e => 'hilo_chat.' + e),
                ...['username'].map(e => 'users.' + e)
            ])
            .from('hilo_chat')
            .leftJoin('users', 'hilo_chat.user_id', 'users.id')
            .orderBy('id', 'desc')
            .limit(20)
            .then(data => {
                this.state.message = data;
            })
    }
    setChat(client, message) {
        hiloChat.create({
            user_id: client.userId,
            text: message
        })
            .then(user => {
                this.state.message.push({
                    id: user[0],
                    user_id: client.userId,
                    username: client.username,
                    text: message
                })
            })
    }
    updateUser(client) {
        client.send('setting', {
            balance: client.balance,
            id: client.userId
        });
        this.getHistory(client);
    }
    getHistory(client) {
        hiloHistory.get(20, { user_id: client.userId })
            .then(history => {
                client.send('history', history)
            })
    }
    setHistory(history) {
        let index = this.clients.findIndex(c => c.userId == history.user_id);
        if (index >= 0) {
            this.clients[index].send('history', [history])
        }
    }
    dispatchCard(getCard) {
        this.state.started = true;
        if (getCard) {
            this.getCard();
        }
        const { type, num, card } = this.card[0];
        hiloGame.create({
            card: card,
        }).then(game => {
            this.gameId = game[0];
        });
        this.state.ratio = { 'hi': hiRatio[num], 'lo': loRatio[num], '=': 5, 'black': 2, 'red': 2, '2-9': 1.5, 'jqka': 3, 'ka': 4, 'jq': 4, 'a': 12 }
    }
    getCard() {
        const num = random(0, 12);
        const type = random(0, 3);
        const card = cardNumber[num] + cardType[type];
        limit(this.card, { type, num, card }, 2);
        this.state.card = card;
    }
    checkResult() {
        this.state.started = false;
        this.getCard();
        limit(this.state.games, { id: this.gameId, card: this.card[1].card }, 10);
        for (let player of this.state.players) {
            let res = this.checkType(player.type);
            let profit = 0;
            if (res) {
                let xprofit = em.mul(this.state.ratio[player.type], player.bet);
                profit = em.sub(xprofit, player.bet);

                console.log(player)
                let ref = this.ref(player.xref);
                whitdraw(player.userId, { ...ref, tid: this.gameId, amount: xprofit });
                this.updateBalance(player.userId, xprofit, true)
            }
            player.status = profit;
            let history = {
                game_id: this.gameId,
                user_id: player.userId,
                type: player.type,
                amount: player.bet,
                state: res ? 1 : 0,
                profit,
            };
            hiloHistory.create(history)
                .then(his => {
                    this.setHistory(history)
                })

        }

        this.clock.setTimeout(() => {
            this.start(false);
        }, 4000);
    }
    setBetting(client, amount, state) {
        this.updateBalance(client.userId, amount, !state);
        hiloBetting.create({
            user_id: client.userId,
            amount,
            state: state ? 1 : 0
        }).then(bet => {

        })
    }
    async updateBalance(userId, amount, state) {
        let index = this.clients.findIndex(c => c.userId == userId);
        const user = await User.findOne({ id: userId });
        let newBalance = state ? em.add(user.balance, amount) : em.sub(user.balance, amount);
        await User.update(userId, { balance: newBalance });
        if (index >= 0) {
            this.clients[index].send('setting', { balance: newBalance });
            this.clients[index].balance = newBalance;
        }
    }
    checkType(playerType) {
        const [{ type, num }, { type: ptype, num: pnum }] = this.card;
        switch (playerType) {
            case 'hi':
                return pnum > num;
            case 'lo':
                return pnum < num;
            case '=':
                return pnum == num;
            case 'red':
                return type < 2;
            case 'black':
                return type > 1;
            case '2-9':
                return num > 3;
            case 'jqka':
                return num < 4;
            case 'ka':
                return num < 2;
            case 'jq':
                return [2, 3].includes(num);
            case 'a':
                return num == 0;
        }
    }
    ref(ref) {
        return { callback: customers[+ref.id].callback, secret: customers[+ref.id].secret, id: ref.user }
    }

}


module.exports = ServerHilo;