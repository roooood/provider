#!/usr/bin/env node
'use strict'
var settings = require('../config/settings');
const { app, gameServer } = require('./index')
const PORT = process.env.PORT || settings.port;

gameServer.listen(PORT);
console.log(`Server started on port ${PORT}`)

// app.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`)
// }).on('error', err => {
//   console.log('ERROR: ', err)
// })
