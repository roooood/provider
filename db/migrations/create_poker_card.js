exports.up = knex => {
  return knex.schema.createTable('poker_cards', t => {
    t.increments('id').primary()
    t.integer('table_id')
    t.string('cards', 20)
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('poker_cards')
}
