exports.up = knex => {
  return knex.schema.createTable('hilo_history', t => {
    t.increments('id').primary()
    t.integer('game_id')
    t.integer('user_id')
    t.string('type', 10)
    t.float('amount')
    t.float('profit')
  })
}

exports.down = knex => {
  return knex.schema.dropTable('hilo_history')
}
