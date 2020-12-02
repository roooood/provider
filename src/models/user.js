'use strict'

const cryptoRandomString = require('crypto-random-string');
const createGuts = require('../helpers/model-guts')

const name = 'User'
const tableName = 'users'


const selectableProps = [
  'id',
  'ref',
  'ref_id',
  'username',
  'balance',
  'status',
  'extra',
  'updated_at',
  'created_at'
]
module.exports = knex => {
  const guts = createGuts({
    knex,
    name,
    tableName,
    selectableProps
  })

  return {
    ...guts,
  }
}
