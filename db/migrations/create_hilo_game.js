exports.up = knex => {
  return knex.schema.createTable('hilo_game', t => {
    t.increments('id').primary()
    t.string('card', 3)
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('hilo_game')
}
