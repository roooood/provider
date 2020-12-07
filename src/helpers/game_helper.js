const { User } = require('../models')
var { post } = require('../helpers/request');

const limit = (arr, data, len) => {
    arr.unshift(data);
    if (arr.length > len) {
        arr.pop();
    }
}
const random = (min, max) => {
    return Math.floor(Math.random() * max) + min;
}
const toggle = (arr, item) => {
    var idx = arr.findIndex(e => e.userId == item.userId);
    if (idx !== -1) {
        arr.splice(idx, 1);
        return false;
    } else {
        arr.unshift(item);
        return true;
    }
}
const get_balance = async (userId, { id, callback, secret }) => {
    const res = await post(callback + 'balance', { secret, id });
    if (res?.result == 'ok') {
        await User.update(userId, { balance: res.data.balance });
        return res.data.balance;
    }
    return false;
}
const deposit = async (userId, { id, callback, secret, amount, tid }) => {
    const res = await post(callback + 'deposit', { secret, id, amount, tid });
    console.log(res)
    if (res?.result == 'ok') {
        await User.update(userId, { balance: res.data.balance });
        return res.data.balance;
    }
    return false;
}
const whitdraw = async (userId, { id, callback, secret, amount, tid }) => {
    const res = await post(callback + 'whitdraw', { secret, id, amount, tid });
    console.log(res)
    if (res?.result == 'ok') {
        await User.update(userId, { balance: res.data.balance });
        return res.data.balance;
    }
    return false;
}
const rollback = async (userId, { id, callback, secret, amount, tid }) => {
    return await whitdraw(userId, { id, callback, secret, amount, tid })
}
module.exports = {
    limit,
    random,
    toggle,
    get_balance,
    deposit,
    rollback,
    whitdraw
}