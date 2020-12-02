'use strict'

const createGuts = require('../helpers/model-guts')

const name = 'hiloChat'
const tableName = 'hilo_chat'


const selectableProps = [
    'id',
    'user_id',
    'text',
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
