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
const get_balance = async (userId, { callback, key: secret }, { id }) => {
    const res = await post(callback + 'balance', { secret, id });
    console.log({ customer: callback, type: 'balance', user: id, response: res })
    if (res?.result == 'ok') {
        await User.update(userId, { balance: res.data.balance });
        return res.data.balance;
    }
    return false;
}
const deposit = async (userId, { callback, key: secret }, { id, amount, tid }) => {
    const res = await post(callback + 'deposit', { secret, id, amount, tid });
    console.log({ customer: callback, type: 'deposit', user: id, response: res })
    if (res?.result == 'ok') {
        await User.update(userId, { balance: res.data.balance });
        return res.data.balance;
    }
    return false;
}
const withdraw = async (userId, { callback, key: secret }, { id, amount, tid }) => {
    const res = await post(callback + 'withdraw', { secret, id, amount, tid });
    console.log({ customer: callback, type: 'withdraw', user: id, response: res })
    if (res?.result == 'ok') {
        await User.update(userId, { balance: res.data.balance });
        return res.data.balance;
    }
    return false;
}
const rollback = async (userId, { callback, key: secret }, { id, amount, tid }) => {
    const res = await post(callback + 'rollback', { secret, id, amount, tid });
    console.log({ customer: callback, type: 'rollback', user: id, response: res })
    if (res?.result == 'ok') {
        await User.update(userId, { balance: res.data.balance });
        return res.data.balance;
    }
    return false;
}
module.exports = {
    limit,
    random,
    toggle,
    get_balance,
    deposit,
    rollback,
    withdraw
}