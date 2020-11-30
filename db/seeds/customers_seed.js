'use strict'

const { Customer } = require('../../src/models')

exports.seed = knex => knex(Customer.tableName).del()
  .then(() => [
    {
      id: 1,
      name: 'demo',
      lang: 'en',
      currency: 'usd',
      comission: 10,
      token: 'demo',
      minBet: 1,
      changeBet: 1,
      maxBet: 100
    }
  ])
  .then(newCustomers => Promise.all(newCustomers.map(customer => Customer.create(customer))))
  .catch(err => console.log('err: ', err))
