const express = require('express')
const expressHandlebars = require('express-handlebars')
const expressSession = require('express-session')
const SQLiteStore = require('connect-sqlite3')(expressSession)

const bcrypt = require('bcrypt')

const sightsRouter = require('./routers/sights-router')
const faqsRouter = require('./routers/faqs-router')
const commentsRouter = require('./routers/comments-router')

//const db = require('./db.js')

const app = express()
app.engine('hbs', expressHandlebars.engine({
	defaultLayout: 'main.hbs'
}))

// Username and password for login
const CORRECT_ADMIN_USERNAME = "Andi"
const CORRECT_HASHED_ADMIN_PASSWORD = "$2b$10$bimmylzie3qrIXsSztKoVOeWAv1go219iEdyK11yJ02sBMwUsFX5e"


// middlewares
app.use(
	express.static('public')
)

app.use(
	expressSession({
		saveUninitialized: false,
		resave: false,
		secret: "laevwfezglwf",
		store: new SQLiteStore()
	})
)

app.use(
	express.static('node_modules/spectre.css/dist')
)

app.use(
	express.urlencoded({
		extended: false
	})
)

app.use(function(request, response, next){
	const isLoggedIn = request.session.isLoggedIn
	response.locals.session = request.session
	next()
})

//Routers
app.use("/sights", sightsRouter)

app.use("/faqs", faqsRouter)

app.use("/comments", commentsRouter)

//GET //
app.get('/', function (request, response) {

	response.render('start.hbs')

})

//GET /about
app.get('/about', function (request, response) {

	response.render('about.hbs')

})

//GET /contact
app.get('/contact', function (request, response) {

	response.render('contact.hbs')

})

//GET /login
app.get('/login', function (request, response) {

	response.render('login.hbs')

})

//GET /logout
app.get('/logout', function (request, response) {

	response.render('logout.hbs')

})

//GET /delete/error
//Special page for delete error
app.get('/delete/error', function (request, response) {

	response.render('delete-error.hbs')

})

//POST /logout
app.post('/logout', function (request, response) {

	const errorMessages = []

	if(request.session.isLoggedIn){

		request.session.isLoggedIn = false
		response.redirect('/')

	} else{

		errorMessages.push('You are not logged in')

		const model = {
			errorMessages
		}

		response.render('logout.hbs', model)
	}
})

//POST /login
app.post('/login', function(request, response){

	const enteredUsername = request.body.username
	const enteredPlaintextPassword = request.body.password

	const errorMessages = []

	if(!request.session.isLoggedIn){

		if(CORRECT_ADMIN_USERNAME == enteredUsername && bcrypt.compareSync(enteredPlaintextPassword, CORRECT_HASHED_ADMIN_PASSWORD)){

			request.session.isLoggedIn = true
			response.redirect('/')

		} else{

			errorMessages.push('Username and password do not match')

			const model = {
				errorMessages,
				enteredUsername,
				CORRECT_HASHED_ADMIN_PASSWORD,
			}

			response.render('login.hbs', model)

		}
	}else{ 

		errorMessages.push('You are already logged in')

		const model = {
			errorMessages,
			enteredUsername,
			enteredPassword
		}

		response.render('login.hbs', model)		
		
	}
})

//Port
app.listen(8080)

