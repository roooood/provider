'use strict'
var _ = require('lodash');
var axios = require('axios');
var jwt = require('jsonwebtoken');
var setting = require('../../config/settings');

const { User, Customer } = require('../models')
const knex = require('../../config/database');

const authUsers = (req, res, next) => {
  //let params = _.pick(req.body, 'type', 'address', 'price');
  const props = req.body;

  Customer.findOne({ token: props.ref })
    .then(customer => {
      if (!customer) {
        return res.json({ 'error': 'customer-error' })
      }
      axios.post(customer.callback + 'user', { token: customer.token, user: props.token })
        .then(({ data }) => {
          if (data?.status) {
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
                  nextUser(res, customer, user)
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
  res.json({ status: true, data })
}

module.exports = {
  authUsers
}
