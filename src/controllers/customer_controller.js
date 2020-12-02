'use strict'

const { User } = require('../models')

const getUser = (req, res, next) => {
  const userId = req.params.id;

  res.json({
    status: true,
    data: {
      id: 1,
      username: 'siavash',
      balance: 5000
    }
  })
}

const getBalance = (req, res, next) => {
  if (userId == 1) {
    res.json({
      status: true,
      data: {
        balance: 5000
      }
    })
  }
  else {
    res.json({
      status: false
    })
  }
}
const setBalance = (req, res, next) => {
  if (userId == 1) {
    res.json({
      status: true,
    })
  }
  else {
    res.json({
      status: false
    })
  }
}

module.exports = {
  getUser,
  getBalance,
  setBalance
}
