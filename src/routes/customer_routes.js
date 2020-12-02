'use strict'

const router = require('express').Router()
const {
  setBalance,
  getBalance,
  getUser,
} = require('../controllers/customer_controller')

router.route('/user')
  .post(getUser)

router.route('/balance/:id')
  .post(getBalance)
  .put(setBalance)

module.exports = router
