'use strict'
var _ = require('lodash');
var { post } = require('../helpers/request');
var jwt = require('jsonwebtoken');
var setting = require('../../config/settings');

const { User, Customer } = require('../models')

const authUsers = (req, res, next) => {
  const props = req.body;
  Customer.findOne({ token: props.customer })
    .then(customer => {
      if (!customer) {
        return res.json({ 'error': 'customer-error' })
      }
      post(customer.callback + 'auth', { secret: customer.secret, token: props.user })
        .then((data) => {
          if (data?.result == 'ok') {
            const { id, username, balance } = data.data;
            const auth = { ref: customer.id, ref_id: id };
            User.findOne(auth)
              .then(user => {
                if (!user) {
                  user = { ...auth, username, balance }
                  User.create(user)
                    .then(newuser => {
                      user.id = newuser[0];
                      nextUser(res, customer, user)
                    })
                }
                else {
                  User.update(user.id, { balance })
                    .then(usr => {
                      nextUser(res, customer, user)
                    })
                }
              })
          }
          else {
            return res.json({ 'error': 'user-error' })
          }
        })
        .catch(function (error) {
          return res.json({ 'error': 'user-error' })
        })
    })

}
const nextUser = (res, customer, user) => {
  const { id, username, balance } = user;
  const { minBet, changeBet, maxBet, currency, lang, callback, token } = customer;
  const data = {
    id, username, balance,
    minBet, changeBet, maxBet, currency, lang,
    token: jwt.sign({ id, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, setting.privateKey)
  }
  res.json({ result: 'ok', data })
}

module.exports = {
  authUsers
}
