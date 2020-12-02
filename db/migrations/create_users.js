exports.up = knex => {
  return knex.schema.createTable('users', t => {
    t.increments('id').primary()
    t.integer('ref')
    t.integer('ref_id')
    t.string('username', 30)
    t.float('balance')
    t.integer('status').defaultTo(1)
    t.string('extra', 500).defaultTo('')
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('users')
}
