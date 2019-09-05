// Import dependencies.
const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const defaults = require('./config/defaults.js')
// Initialize app.
const app = express()

// PORT is either the port provided by Heroku via process.env.PORT or 6969.
const PORT = process.env.PORT || 6969

// Set up middleware.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.text())
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
app.use(express.static(__dirname + '/app/public'))

// Import routes.
require('./app/routing/apiRoutes')(app)
require('./app/routing/htmlRoutes')(app)

// Start listening.
app.listen(defaults.port, () => {
	console.log(`\n*** Server Running on http://localhost:${defaults.port} ***\n`)
})
