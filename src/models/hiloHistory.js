'use strict'

const createGuts = require('../helpers/model-guts')

const name = 'hiloHistory'
const tableName = 'hilo_history'


const selectableProps = [
    'id',
    'game_id',
    'user_id',
    'amount',
    'profit',
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
