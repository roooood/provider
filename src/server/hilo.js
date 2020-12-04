const { Room } = require("colyseus");
const em = require('exact-math');
var jwt = require('jsonwebtoken');
var setting = require('../../config/settings');
const knex = require('../../config/database');
const { User, hiloHistory, hiloChat, hiloGame, hiloBetting } = require('../models')

const cardNumber = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const cardType = ['h', 'd', 's', 'c'];

const loRatio = [1.09, 1.2, 1.33, 1.5, 1.7, 2, 2.4, 3, 4, 6, 1.8, 12, 0];
const hiRatio = [0, 12, 6, 4.8, 4, 3, 2.4, 2, 1.7, 1.5, 1.33, 1.2, 1.9];

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
        this.setState(new State());
        this.getChats();
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
                this.setBet(client, message);
                break;
        }
    }
    setBet(client, { bet, type }) {
        bet = parseInt(bet);
        let res = this.toggle(this.state.players, {
            userId: client.userId,
            user: client.username,
            type: type,
            bet: bet,
            status: null
        })
        this.setBetting(client, bet, res);
        client.send('beted', res);
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
        const { type, num } = this.card[0];
        this.state.ratio = { 'hi': hiRatio[num], 'lo': loRatio[num], '=': 5, 'black': 2, 'red': 2, '2-9': 1.5, 'jqka': 3, 'ka': 4, 'jq': 4, 'a': 12 }
    }
    getCard() {
        const num = this.random(0, 12);
        const type = this.random(0, 3);
        this.card.unshift({ type, num });
        if (this.card.length > 2) {
            this.card.pop();
        }
        this.state.card = cardNumber[num] + cardType[type];
    }
    checkResult() {
        this.state.started = false;
        this.getCard();
        let card = cardNumber[this.card[1].num] + cardType[this.card[1].type];
        hiloGame.create({
            card: card,
        })
            .then(game => {
                let gameId = game[0];
                this.state.games.unshift({
                    id: gameId,
                    card
                });
                if (this.state.games.length > 10) {
                    this.state.games.pop();
                }
                for (let player of this.state.players) {
                    let res = this.checkType(player.type);
                    let profit = 0;
                    if (res) {
                        let xprofit = em.mul(this.state.ratio[player.type], player.bet);
                        profit = em.sub(xprofit, player.bet);
                        this.updateBalance(player.userId, xprofit, true)
                    }
                    player.status = profit;
                    let history = {
                        game_id: gameId,
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
            });

        this.clock.setTimeout(() => {
            this.start(false);
        }, 4000);
    }

    setBetting(client, amount, state) {
        this.updateBalance(client, amount, !state);

        hiloBetting.create({
            user_id: client.userId,
            amount,
            state: state ? 1 : 0
        }).then(bet => {

        })
    }
    updateBalance(client, amount, state) {
        if (Number.isInteger(client)) {
            let index = this.clients.findIndex(c => c.userId == client);
            client = this.clients[index];
        }
        let newBalance = state ? em.add(client.balance, amount) : em.sub(client.balance, amount);
        let balance = { balance: newBalance };
        client.balance = newBalance;

        User.update(client.userId, balance)
        client.send('setting', balance);
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
    random(min, max) {
        return Math.floor(Math.random() * max) + min;
    }
    toggle(arr, item) {
        var idx = arr.findIndex(e => e.userId == item.userId);
        if (idx !== -1) {
            arr.splice(idx, 1);
            return false;
        } else {
            arr.unshift(item);
            return true;
        }
    }
}


module.exports = ServerHilo;