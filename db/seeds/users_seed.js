'use strict'

const { User } = require('../../src/models')

exports.seed = knex => knex(User.tableName).del()
  .then(() => [
    {
      id: 1,
      ref: 1,
      username: 'siavash',
      balance: 5000,
      status: 1,
      token: '1',
      extra: '',
    },
    {
      id: 2,
      ref: 1,
      username: 'aref',
      balance: 5000,
      status: 1,
      token: '2',
      extra: '',
    }
  ])
  .then(newUsers => Promise.all(newUsers.map(user => User.create(user))))
  .catch(err => console.log('err: ', err))
