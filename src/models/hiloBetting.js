'use strict'

const createGuts = require('../helpers/model-guts')

const name = 'hiloBetting'
const tableName = 'hilo_betting'


const selectableProps = [
    'id',
    'user_id',
    'amount',
    'state',
    'created_at',
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
