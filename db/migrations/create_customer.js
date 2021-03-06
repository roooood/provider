exports.up = knex => {
  return knex.schema.createTable('customers', t => {
    t.increments('id').primary()
    t.string('name', 50)
    t.string('secret', 25)
    t.string('token', 25)
    t.string('callback', 255)
    t.string('lang', 5)
    t.string('currency', 5)
    t.integer('comission')
    t.float('minBet')
    t.float('changeBet')
    t.float('maxBet')
    t.float('ratio')
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('customers')
}
