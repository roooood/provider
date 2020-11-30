'use strict'

const router = require('express').Router()
const {
  authUsers,
} = require('../controllers/auth_controller')

router.route('/auth')
  .post(authUsers)


module.exports = router
