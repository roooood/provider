const { Room } = require("colyseus");
const knex = require('../../config/database');
const { User, hiloHistory, hiloChat } = require('../models')

const cardNumber = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const cardType = ['h', 'd', 's', 'c'];
const hiRatio = [1.09, 1.2, 1.33, 1.5, 1.71, 2, 2.4, 3, 4, 6, 12, 0];
const loRatio = hiRatio.reverse();

class State {
    constructor() {
        this.players = [];
        this.ratio = {};
    }
}

class ServerHilo extends Room {
    maxClients = 1;
    onCreate(options) {
        this.setState(new State());
        this.getChats();
        this.clock.setTimeout(() => {
            this.start();
        }, 1000);
        this.onMessage("*", (client, type, message) => {
            this.receive(client, type, message);
        });
    }

    async onAuth(client, { token }, req) {
        const user = await User.find({ token }).then(user => user[0]);
        if ('id' in user) {
            client.userId = user.id;
            client.username = user.username;
            client.balance = user.balance;
            return true;
        }
        return false;
    }

    onJoin(client, options, auth) {
        this.updateUser(client)
    }

    receive(client, type, message) {
        switch (type) {
            case 'refresh':
                this.dispatchCard();
                break;
            case 'chat':
                this.getChat(client, message);
                break;
            case 'bet':
                this.setBet(client, message);
                break;
        }
    }
    setBet(client, { bet, type }) {
        let res = this.toggle(this.state.players, {
            userId: client.userId,
            user: client.username,
            type: type,
            bet: bet,
            status: '-'
        })
        client.send('beted', res);
    }
    start() {
        this.state.players = [];
        this.dispatchCard();
        this.clock.setTimeout(() => {
            this.checkResult();
        }, 8000);
    }
    getChats() {
        knex
            .select([
                ...['id', 'ref', 'text', 'created_at'].map(e => 'hilo_chat.' + e),
                ...['username'].map(e => 'users.' + e)
            ])
            .from('hilo_chat')
            .leftJoin('users', 'hilo_chat.ref', 'users.id')
            .limit(20)
            .then(data => {
                this.state.message = data;
            })
    }
    getChat(client, message) {
        hiloChat.create(
            {
                ref: client.userId,
                text: message
            }
        ).then(user => {
            this.state.message.push({
                id: user[0],
                ref: client.userId,
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
        this.getHistory(client.userId);
    }
    getHistory(id) {
        let index = this.clients.findIndex(c => c.userId == id)
        hiloHistory.get(20, { ref: id })
            .then(history => {
                this.clients[index].send('history', history)
            })
    }
    dispatchCard() {
        this.broadcast('started', 10);
        const num = this.random(0, 12);
        const type = this.random(0, 3);
        this.card = { type, num };
        this.state.ratio = { 'hi': hiRatio[num], 'lo': loRatio[num], '=': 5, 'black': 2, 'red': 2, '2-9': 1.5, 'jqka': 3, 'ka': 4, 'jq': 4, 'a': 12 }
        this.broadcast('card', [cardNumber[num], cardType[type]]);
    }
    checkResult() {
        this.broadcast('ended', true);
        const num = this.random(0, 12);
        const type = this.random(0, 3);

        for (let player of this.state.players) {
            let res = this.checkType(player.type, { type, num });
            let profit = this.state.ratio[player.type] * player.bet;
            profit = res ? profit?.toFixed(2) : 0
            player.status = profit;
            hiloHistory.create(
                {
                    ref: player.userId,
                    type: player.type,
                    amount: player.bet,
                    profit,
                }
            ).then(history => {
                this.getHistory(player.userId)
            })

        }
        this.broadcast('card', [cardNumber[num], cardType[type]]);
        this.clock.setTimeout(() => {
            //this.start();
        }, 4000);
    }
    checkType(ptype, { type, num }) {
        let { type: btype, num: bnum } = this.card;
        switch (ptype) {
            case 'hi':
                return bnum > num;
            case 'lo':
                return bnum < num;
            case '=':
                return bnum == num;
            case 'red':
                return type < 2;
            case 'black':
                return type > 1;
            case '2-9':
                return num > 3;
            case 'jqka':
                return num < 4;
            case 'ka':
                return [0, 1].includes(num);
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