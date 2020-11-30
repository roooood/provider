exports.up = knex => {
  return knex.schema.createTable('hilo_betting', t => {
    t.increments('id').primary()
    t.integer('user_id')
    t.float('amount')
    t.integer('state')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('hilo_betting')
}
