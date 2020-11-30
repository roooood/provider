'use strict'

const { User } = require('../../src/models')

exports.seed = knex => knex(User.tableName).del()
  .then(() => [
    {
      id: 1,
      ref: 1,
      username: 'test',
      balance: 5000,
      token: '1',
    }
  ])
  .then(newUsers => Promise.all(newUsers.map(user => User.create(user))))
  .catch(err => console.log('err: ', err))
