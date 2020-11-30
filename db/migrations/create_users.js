exports.up = knex => {
  return knex.schema.createTable('users', t => {
    t.increments('id').primary()
    t.integer('ref')
    t.string('username', 50)
    t.float('balance')
    t.integer('status')
    t.string('token', 50)
    t.string('extra', 500)
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('users')
}
