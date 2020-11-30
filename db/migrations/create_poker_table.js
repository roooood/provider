exports.up = knex => {
  return knex.schema.createTable('poker_tables', t => {
    t.increments('id').primary()
    t.string('name', 20)
    t.string('position', 20)
    t.string('type', 10)
    t.integer('player')
    t.integer('min')
    t.integer('max')
    t.integer('sb')
    t.integer('bb')
    t.integer('bb')
    t.integer('order')
    t.string('extra', 500)
  })
}

exports.down = knex => {
  return knex.schema.dropTable('poker_tables')
}
