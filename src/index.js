'use strict'

const { createServer } = require('http');
var cors = require('cors');
const { Server } = require('colyseus');
const { monitor } = require('@colyseus/monitor');
const { demo, hilo } = require('./server');
const express = require('express');
const bodyParser = require('body-parser');

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.options('*', cors())
app.use(cors())

const gameServer = new Server({
  server: createServer(app),
  express: app,
  pingInterval: 0,
});

//define game servers
gameServer.define("demo", demo);
gameServer.define("hilo", hilo);
gameServer.onShutdown(function () {
  console.log(`game server is going down.`);
});
app.use('/monitor', monitor());

//define game routes
app.use('/', [
  require('./routes/user_routes'),
  require('./routes/auth_routes'),
])

//define game middleware
app.use(require('./middleware/error_middleware').all)


module.exports = { app, gameServer }
