'use strict'

const cryptoRandomString = require('crypto-random-string');
const createGuts = require('../helpers/model-guts')

const name = 'Customer'
const tableName = 'customers'


const selectableProps = [
    'id',
    'name',
    'lang',
    'currency',
    'comission',
    'token',
    'minBet',
    'changeBet',
    'maxBet',
    'updated_at',
    'created_at'
]

const beforeSave = user => {
    let hash = cryptoRandomString({ length: 50, type: 'base64' });
    return Promise.resolve({ ...user, token: hash })
}

module.exports = knex => {
    const guts = createGuts({
        knex,
        name,
        tableName,
        selectableProps
    })

    const create = props => beforeSave(props)
        .then(customer => guts.create(customer));

    return {
        ...guts,
        create
    }
}
