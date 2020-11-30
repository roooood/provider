exports.up = knex => {
  return knex.schema.createTable('poker_hands', t => {
    t.increments('id').primary()
    t.integer('table_id')
    t.integer('user_id')
    t.string('cards', 20)
  })
}

exports.down = knex => {
  return knex.schema.dropTable('poker_handas')
}
