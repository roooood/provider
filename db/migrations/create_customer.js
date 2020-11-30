exports.up = knex => {
  return knex.schema.createTable('customers', t => {
    t.increments('id').primary()
    t.string('name', 50)
    t.string('lang', 2)
    t.string('currency', 5)
    t.integer('comission')
    t.string('token', 50)
    t.float('minBet')
    t.float('changeBet')
    t.float('maxBet')
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('customers')
}
