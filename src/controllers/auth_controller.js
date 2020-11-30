'use strict'
var _ = require('lodash');

// const { User, Customer } = require('../models')
const knex = require('../../config/database');

const authUsers = (req, res, next) => {
  //let params = _.pick(req.body, 'type', 'address', 'price');
  const props = req.body;
  knex
    .select([
      ...['minBet', 'changeBet', 'maxBet', 'currency', 'lang'].map(e => 'customers.' + e),
      ...['token', 'balance', 'username'].map(e => 'users.' + e)
    ]).
    from('users').
    leftJoin('customers', 'users.ref', 'customers.id')
    .where('customers.name', props.ref)
    .where('users.token', props.token)
    .then(result => result[0])
    .then(data => res.json(data))
}


module.exports = {
  authUsers
}
