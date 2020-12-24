'use strict'

const { Customer } = require('../../src/models')

exports.seed = knex => knex(Customer.tableName).del()
  .then(() => [
    {
      id: 1,
      name: 'aref',
      key: 'secret',
      token: 'demo',
      callback: 'http://localhost:2567/',
      lang: 'en',
      currency: 'usd',
      comission: 10,
      minBet: 1,
      changeBet: 1,
      maxBet: 100,
      ratio: 1,
    },
    {
      id: 1,
      name: 'amk',
      key: 'secret2',
      token: 'test',
      callback: 'http://localhost:2567/',
      lang: 'en',
      currency: 'usd',
      comission: 10,
      minBet: 1,
      changeBet: 1,
      maxBet: 100,
      ratio: .9,
    }
  ])
  .then(newCustomers => Promise.all(newCustomers.map(customer => Customer.create(customer))))
  .catch(err => console.log('err: ', err))
