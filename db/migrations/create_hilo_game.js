exports.up = knex => {
  return knex.schema.createTable('hilo_game', t => {
    t.increments('id').primary()
    t.string('type', 1)
    t.string('num', 1)
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('hilo_game')
}
