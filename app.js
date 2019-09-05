const express = require('express')
require('dotenv').config()
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

console.log('enviroment', process.env.NODE_ENV)
const CONNECTION_URI = process.env.MONGODB_URI || mongodb://localhost/ideabot-dev
const server = express()
const PORT = process.env.PORT || 6969
// Map global promise - get rid of warning
mongoose.Promise = global.Promise
// Connect to mongoose
mongoose
	.connect('mongodb://localhost/ideabot-dev', {
		useMongoClient: true
	})
	.then(() => console.log('MongoDB Connected...'))
	.catch((err) => console.log(err))

// Load Idea Model
require('./models/Idea')
const Idea = mongoose.model('ideas')

// Handlebars Middleware
server.engine(
	'handlebars',
	exphbs({
		defaultLayout: 'main'
	})
)
server.set('view engine', 'handlebars')

// Body parser middleware
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

// Method override middleware
server.use(methodOverride('_method'))

// Express session midleware
server.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true
	})
)

server.use(flash())

// Global variables
server.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	res.locals.error = req.flash('error')
	next()
})

// Index Route
server.get('/', (req, res) => {
	const title = 'Welcome'
	res.render('index', {
		title: title
	})
})

// About Route
server.get('/about', (req, res) => {
	res.render('about')
})

// Idea Index Page
server.get('/ideas', (req, res) => {
	Idea.find({}).sort({ date: 'desc' }).then((ideas) => {
		res.render('ideas/index', {
			ideas: ideas
		})
	})
})

// Add Idea Form
server.get('/ideas/add', (req, res) => {
	res.render('ideas/add')
})

// Edit Idea Form
server.get('/ideas/edit/:id', (req, res) => {
	Idea.findOne({
		_id: req.params.id
	}).then((idea) => {
		res.render('ideas/edit', {
			idea: idea
		})
	})
})

// Process Form
server.post('/ideas', (req, res) => {
	let errors = []

	if (!req.body.title) {
		errors.push({ text: 'Please add a title' })
	}
	if (!req.body.details) {
		errors.push({ text: 'Please add some details' })
	}

	if (errors.length > 0) {
		res.render('ideas/add', {
			errors: errors,
			title: req.body.title,
			details: req.body.details
		})
	} else {
		const newUser = {
			title: req.body.title,
			details: req.body.details
		}
		new Idea(newUser).save().then((idea) => {
			req.flash('success_msg', 'Your idea added')
			res.redirect('/ideas')
		})
	}
})

// Edit Form process
server.put('/ideas/:id', (req, res) => {
	Idea.findOne({
		_id: req.params.id
	}).then((idea) => {
		// new values
		idea.title = req.body.title
		idea.details = req.body.details

		idea.save().then((idea) => {
			req.flash('success_msg', 'Your idea was updated')
			res.redirect('/ideas')
		})
	})
})

// Delete Idea
server.delete('/ideas/:id', (req, res) => {
	Idea.remove({ _id: req.params.id }).then(() => {
		req.flash('success_msg', 'our idea was removed')
		res.redirect('/ideas')
	})
})

server.listen(PORT, () => {
	console.log(`Kicking back and having a cold one on port ${PORT}...`)
})
