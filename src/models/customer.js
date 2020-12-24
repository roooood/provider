'use strict'

const cryptoRandomString = require('crypto-random-string');
const createGuts = require('../helpers/model-guts')

const name = 'Customer'
const tableName = 'customers'


const selectableProps = [
    'id',
    'name',
    'key',
    'token',
    'callback',
    'lang',
    'currency',
    'comission',
    'minBet',
    'changeBet',
    'maxBet',
    'ratio',
    'updated_at',
    'created_at'
]

// const beforeSave = user => {
//     let hash = cryptoRandomString({ length: 25, type: 'base64' });
//     return Promise.resolve({ ...user, token: hash })
// }

module.exports = knex => {
    const guts = createGuts({
        knex,
        name,
        tableName,
        selectableProps
    })

    // const create = props => beforeSave(props)
    //     .then(customer => guts.create(customer));

    return {
        ...guts,
    }
}
