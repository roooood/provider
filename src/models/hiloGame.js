'use strict'

const createGuts = require('../helpers/model-guts')

const name = 'hiloGame'
const tableName = 'hilo_game'


const selectableProps = [
    'id',
    'type',
    'num',
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
