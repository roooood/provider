exports.up = knex => {
  return knex.schema.createTable('poker_chat', t => {
    t.increments('id').primary()
    t.integer('user_id')
    t.string('text', 255)
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('poker_chat')
}
