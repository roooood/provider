#!/usr/bin/env node
'use strict'

const { app, gameServer } = require('./index')
const PORT = process.env.PORT || 2567;

gameServer.listen(PORT);
console.log(`Server started on port ${PORT}`)

// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`)
// }).on('error', err => {
//   console.log('ERROR: ', err)
// })
