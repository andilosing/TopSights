const express = require('express')
const expressHandlebars = require('express-handlebars')
const sqlite3 = require('sqlite3')
const expressSession = require('express-session')
const db = new sqlite3.Database("topSights-database.db")


const multer = require('multer')
const upload = multer({
	storage:multer.memoryStorage(),
	/*fileFilter: (req, file, cb) => {
		if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
		  cb(null, true);
		} else {
		  cb(null, false);
		  return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
		}
	  }*/
})


const SIGHT_NAME_MAX_LENGTH = 40
const SIGHT_CITY_MAX_LENGTH = 40
const SIGHT_COUNTRY_MAX_LENGTH = 40
const SIGHT_INFO_MAX_LENGTH = 250

const FAQ_QUESTION_MAX_LENGTH = 100
const FAQ_ANSWER_MAX_LENGTH = 250

const COMMENT_AUTHOR_MAX_LENGTH = 40
const COMMENT_TOPIC_MAX_LENGTH = 40
const COMMENT_TEXT_MAX_LENGTH = 40
const COMMENT_RATING_MAX_NUMBER = 10

const CORRECT_ADMIN_USERNAME = "Andi"
const CORRECT_ADMIN_PASSWORD = "123"

db.run(`
	CREATE TABLE IF NOT EXISTS sights   (
		id INTEGER PRIMARY KEY,
		name TEXT,
		city TEXT,
		country TEXT,
		info TEXT,
		image LONGTEXT )`
)

db.run(`
	CREATE TABLE IF NOT EXISTS comments   (
		id INTEGER PRIMARY KEY,
		author TEXT,
		topic TEXT,
		text TEXT,
		rating INTEGER 
	)`
)

db.run(`
	CREATE TABLE IF NOT EXISTS faqs   (
		id INTEGER PRIMARY KEY,
		question TEXT,
		answer TEXT 
	)`
)

const app = express()

app.engine('hbs', expressHandlebars.engine({
	defaultLayout: 'main.hbs'
}))

app.use(
	express.static('public')
)

app.use(
	expressSession({
		saveUninitialized: false,
		resave: false,
		secret: "laevwfezglwf"
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
	response.locals.isLoggedIn = isLoggedIn
	next()
})

app.get('/', function (request, response) {
	response.render('start.hbs')
})

app.get('/about', function (request, response) {
	response.render('about.hbs')
})

app.get('/contact', function (request, response) {
	response.render('contact.hbs')
})

app.get('/login', function (request, response) {
	response.render('login.hbs')
})

app.get('/logout', function (request, response) {
	response.render('logout.hbs')
})

app.get('/delete/error', function (request, response) {
	response.render('delete-error.hbs')
})

app.post('/logout', function (request, response) {
	const errorMessages = []
	if(request.session.isLoggedIn){
	request.session.isLoggedIn = false
	response.redirect('/')
	} else{
		errorMessages.push('You are not logged in')
		const model = {
			errorMessages}
		response.render('logout.hbs', model)
	}
})

app.post('/login', function(request, response){
	const enteredUsername = request.body.username
	const enteredPassword = request.body.password

	const errorMessages = []

	if(!request.session.isLoggedIn){
		if(CORRECT_ADMIN_USERNAME == enteredUsername && CORRECT_ADMIN_PASSWORD == enteredPassword){
			request.session.isLoggedIn = true
			response.redirect('/')
		} else{
			errorMessages.push('Username and password do not match')

			const model = {
				errorMessages,
				enteredUsername,
				enteredPassword					}
			response.render('login.hbs', model)


		}
	} else{ 
		errorMessages.push('You are already logged in')
		const model = {
			errorMessages,
			enteredUsername,
			enteredPassword					}
		response.render('login.hbs', model)
		
		
	}


})



function getValidationErrorsForSight(name, city, country, info){
	const errorMessages = []
	
	if(name == ""){
		errorMessages.push("Name can't be empty")
	}else if(SIGHT_NAME_MAX_LENGTH < name.length){
		errorMessages.push("Name must be shorter than "+SIGHT_NAME_MAX_LENGTH+" characters long")
	}

	if(city == ""){
		errorMessages.push("City can't be empty")
	}else if(SIGHT_CITY_MAX_LENGTH < city.length){
		errorMessages.push("City must be shorter than "+SIGHT_CITY_MAX_LENGTH+" characters long")
	}

	if(country == ""){
		errorMessages.push("Country can't be empty")
	}else if(SIGHT_COUNTRY_MAX_LENGTH < country.length){
		errorMessages.push("Country must be shorter than "+SIGHT_COUNTRY_MAX_LENGTH+" characters long")
	}

	if(info == ""){
		errorMessages.push("Info of sight can't be empty")
	}else if(SIGHT_INFO_MAX_LENGTH < info.length){
		errorMessages.push("Info must be shorter than "+SIGHT_INFO_MAX_LENGTH+" characters long")
	}

	return errorMessages
}


app.get('/sights', function (request, response) {
	const query = `SELECT * FROM sights`
	db.all(query, function(error, sights){
		const model = {
			sights
		}
		response.render('sights.hbs', model)
	})	
})

app.get("/sights/create", function(request, response){
	response.render("create-sight.hbs")
})

app.post("/sights/create", upload.single('image'), function(request, response){	
	const name = request.body.name
	const city = request.body.city
	const country = request.body.country
	const info = request.body.info
	let image = ""
	if(request.file == undefined ){
		 
	} else{
	if(request.file.mimetype == "image/jpg" || request.file.mimetype == "image/png"  || request.file.mimetype == "image/jpeg"){
		console.log('es geht')
		 image = request.file.buffer.toString('base64')
	}else{
		
		
	image = "/placeholderIMG.png"
	}}
	
	
	


	const errorMessages = getValidationErrorsForSight(name, city, country, info)

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}
	
	if(errorMessages.length == 0){

	const query = `INSERT INTO sights (name, city, country, info, image) VALUES (?, ?, ?, ?, ?)`
	const values = [name, city, country, info, image]
	db.run(query, values, function(error){

		if(error){
				
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				name,
				city,
				country,
				info,
				image
			}

			response.render('create-sight.hbs', model)
		}else{
			response.redirect("/sights")
		}

			
	})

	} else{
		
		const model = {
			errorMessages,
			name,
			city,
			country,
			info,
			image
		}

		
		response.render('create-sight.hbs', model)
		
	}
})

app.post("/sight/delete/:id", function(request, response){
	const id = request.params.id
	const query = `DELETE FROM sights WHERE id = ?`
	const values = [id]

	const errorMessages = []

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}

	if(errorMessages.length == 0){
	
	db.run(query, values, function(error){

		if(error){
				
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				pagePath: "/sights",
				pageName: "sights",
				deleteErrorFor: "sight"
			}

			response.render('delete-error.hbs', model)
		}else{
			response.redirect("/sights")
		}

	})	

	}else{

		const model= {
			errorMessages,
			pagePath: "/sights",
			pageName: "sights",
			deleteErrorFor: "sight"
		}
		response.render('delete-error.hbs', model)

	}
})

app.get("/sight/update/:id", function (request, response) {
	const id = request.params.id

	const query = `SELECT * FROM sights WHERE id = ?`
	const values = [id]
	db.get(query, values, function(error, sight){
		const model = {
			sight
		}
		response.render('update-sight.hbs', model)
	})	
})

app.post("/sight/update/:id", upload.single('image'), function(request, response){
	const id = request.params.id
	const newName = request.body.name
	const newCity = request.body.city
	const newCountry = request.body.country
	const newInfo = request.body.info
	const newImage = request.file.buffer.toString('base64')

	const errorMessages = getValidationErrorsForSight(newName, newCity, newCountry, newInfo)

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}

	if(errorMessages.length == 0){
		

		const query = `UPDATE sights SET name = ?, city = ?, country = ?, info = ?, image = ? WHERE id = ?`
		const values = [newName, newCity, newCountry, newInfo, newImage, id]
		db.run(query, values, function(error){

			if(error){
				
				errorMessages.push("Internal server error")
	
				const model = {
					errorMessages,
					sight: {
						id,
						name: newName,
						city: newCity,
						country: newCountry,
						info: newInfo
						}
					}
	
				response.render('update-sight.hbs', model)
			}else{
				response.redirect("/sights")
			}
			
		})
	} else{
		const model= {
			errorMessages,
			sight: {
				id,
				name: newName,
				city: newCity,
				country: newCountry,
				info: newInfo
			} 

		}
		response.render('update-sight.hbs', model)
	}
})

app.get("/sights/:id", function (request, response) {
	const id = request.params.id
	const query = `SELECT * FROM SIGHTS WHERE id = ?`
	const values = [id]
	db.get(query, values, function(error, sight){
		const model = {
			sight
		}
		response.render('sight.hbs', model)
	})
})

app.get('/faqs', function (request, response) {
	const query = `SELECT * FROM faqs`
	db.all(query, function(error, faqs){
		const model = {
			faqs
		}
		response.render('faqs.hbs', model)
	})	
})

function getValidationErrorsForFaq(question,answer){
	const errorMessages = []
	
	if(question == ""){
		errorMessages.push("Question can't be empty")
	}else if(FAQ_QUESTION_MAX_LENGTH < question.length){
		errorMessages.push("Question must be shorter than "+FAQ_QUESTION_MAX_LENGTH+" characters long")
	}

	if(answer == ""){
		errorMessages.push("Answer can't be empty")
	}else if(FAQ_ANSWER_MAX_LENGTH < answer.length){
		errorMessages.push("Answer must be shorter than "+FAQ_ANSWER_MAX_LENGTH+" characters long")
	}

	return errorMessages
}

app.get("/faq/create", function(request, response){
	response.render("create-faq.hbs")
})

app.post("/faq/create", function(request, response){	
	const question = request.body.question
	const answer = request.body.answer

	const errorMessages = getValidationErrorsForFaq(question, answer)

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}

	if(errorMessages.length == 0){

		const query = `INSERT INTO faqs (question, answer) VALUES (?, ?)`
		const values = [question, answer,]
		db.run(query, values, function(error){

			if(error){
				
				errorMessages.push("Internal server error")
	
				const model = {
					errorMessages,
					question,
					answer
				}
	
				response.render('create-faq.hbs', model)
			}else{
				response.redirect("/faqs")
			}
	})
	} else{
		const model = {
			errorMessages,
			question,
			answer
		}

		
		response.render('create-faq.hbs', model)
	}
})

app.post("/faq/delete/:id", function(request, response){
	const id = request.params.id
	const query = `DELETE FROM faqs WHERE id = ?`
	const values = [id]

	const errorMessages = []

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}

	if(errorMessages.length == 0){
	
	db.run(query, values, function(error){

		if(error){
				
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				pagePath: "/faqs",
				pageName: "faqs",
				deleteErrorFor: "faq"
			}

			response.render('delete-error.hbs', model)
		}else{
			response.redirect("/faqs")
		}

	})	

	}else{

		const model= {
			errorMessages,
			pagePath: "/faqs",
			pageName: "faqs",
			deleteErrorFor: "faq"
		}
		response.render('delete-error.hbs', model)

	}
	
})

app.get("/faq/update/:id", function (request, response) {
	const id = request.params.id

	const query = `SELECT * FROM faqs WHERE id = ?`
	const values = [id]
	db.get(query, values, function(error, faq){
		const model = {
			faq
		}
		response.render('update-faq.hbs', model)
	})	
})

app.post("/faq/update/:id", function(request, response){
	const id = request.params.id
	const newQuestion = request.body.question
	const newAnswer = request.body.answer

	const errorMessages = getValidationErrorsForFaq(newQuestion, newAnswer)

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}

	if(errorMessages.length == 0){
	
		const query = `UPDATE faqs SET question = ?, answer = ? WHERE id = ?`
		const values = [newQuestion, newAnswer, id]
		db.run(query, values, function(error){

			if(error){
					
				errorMessages.push("Internal server error")

				const model = {
					errorMessages,
					faq: {
						id,
						question: newQuestion,
						answer: newAnswer,
						}
					}

				response.render('update-faq.hbs', model)
			}else{
				response.redirect("/faqs")
			}
			
		}) 
	} else{
		const model= {
			errorMessages,
					faq: {
						id,
						question: newQuestion,
						answer: newAnswer,
						}

		}
		response.render('update-faq.hbs', model)
	}
})

function getValidationErrorsForComment(author, topic, text, rating){
	const errorMessages = []

	if(author == ""){
		errorMessages.push("Author can't be empty")
	}else if(COMMENT_AUTHOR_MAX_LENGTH < author.length){
		errorMessages.push("Author must be shorter than "+COMMENT_AUTHOR_MAX_LENGTH+" characters long")
	}

	if(topic == ""){
		errorMessages.push("Topic can't be empty")
	}else if(COMMENT_TOPIC_MAX_LENGTH < topic.length){
		errorMessages.push("Topic must be shorter than "+COMMENT_TOPIC_MAX_LENGTH+" characters long")
	}

	if(text == ""){
		errorMessages.push("Text can't be empty")
	}else if(COMMENT_TEXT_MAX_LENGTH < topic.length){
		errorMessages.push("Text must be shorter than "+COMMENT_TEXT_MAX_LENGTH+" characters long")
	}

	if(isNaN(rating)){
		errorMessages.push("You did not enter a number for the rating")
	}else if(rating == ""){
		errorMessages.push("Rating can't be empty")
	}else if(rating < 0){
		errorMessages.push("Rating may not be negative")
	}else if(10 < rating){
		errorMessages.push("Rating may at most be 10")
	}

	return errorMessages
}

app.get('/comments', function (request, response) {
	const query = `SELECT * FROM comments`
	db.all(query, function(error, comments){
		const model = {
			comments
		}
		response.render('comments.hbs', model)
	})
})

app.get("/comments/create", function(request, response){
	response.render("create-comment.hbs")
})

app.post("/comments/create", function(request, response){	
	const author = request.body.author
	const topic = request.body.topic
	const text = request.body.text
	const rating = parseInt(request.body.rating)

	const errorMessages = getValidationErrorsForComment(author, topic, text, rating)

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}

	if(errorMessages.length == 0){

		const query = `INSERT INTO comments (author, topic, text, rating) VALUES (?, ?, ?, ?)`
		const values = [author, topic, text, rating]
		db.run(query, values, function(error){

			if(error){
				
				errorMessages.push("Internal server error")
	
				const model = {
					errorMessages,
					author,
					topic,
					text,
					rating
				}
	
				response.render('create-comment.hbs', model)
			}else{
				response.redirect("/comments")
			}
		})
	} else{

		const model = {
			errorMessages,
			author,
			topic,
			text,
			rating
		}

		response.render('create-comment.hbs', model)

	}
})



app.get("/comment/update/:id", function (request, response) {
	const id = request.params.id

	const query = `SELECT * FROM comments WHERE id = ?`
	const values = [id]
	db.get(query, values, function(error, comment){
		const model = {
			comment
		}
		response.render('update-comment.hbs', model)
	})	
})

app.post("/comment/update/:id", function(request, response){
	const id = request.params.id
	const newAuthor = request.body.author
	const newTopic = request.body.topic
	const newText = request.body.text
	const newRating = request.body.rating

	const errorMessages = getValidationErrorsForComment(newAuthor, newTopic, newText, newRating)

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}

	if(errorMessages.length == 0){

		const query = `UPDATE comments SET author = ?, topic = ?, text = ?, rating = ? WHERE id = ?`
		const values = [newAuthor, newTopic, newText, newRating, id]
		db.run(query, values, function(error){

			if(error){
					
				errorMessages.push("Internal server error")

				const model = {
					errorMessages,
					comment: {
						id,
						author: newAuthor,
						topic: newTopic,
						text: newText,
						rating: newRating
						}
					}

				response.render('update-comment.hbs', model)
			}else{
				response.redirect("/comments")
			}
		})
	}else{
		const model= {
			errorMessages,
			comment: {
				id,
				author: newAuthor,
				topic: newTopic,
				text: newText,
				rating: newRating
				}

		}
		response.render('update-comment.hbs', model)
	}
})

app.post("/comment/delete/:id", function(request, response){
	const id = request.params.id
	const query = `DELETE FROM comments WHERE id = ?`
	const values = [id]


	const errorMessages = []

	if(!request.session.isLoggedIn){
		errorMessages.push('You are not logged in')
	}

	if(errorMessages.length == 0){
	
	db.run(query, values, function(error){

		if(error){
				
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				pagePath: "/comments",
				pageName: "comments",
				deleteErrorFor: "comment"
			}

			response.render('delete-error.hbs', model)
		}else{
			response.redirect("/comments")
		}

	})	

	}else{

		const model= {
			errorMessages,
			pagePath: "/comments",
			pageName: "comments",
			deleteErrorFor: "comment"
		}
		response.render('delete-error.hbs', model)

	}
	
})



app.listen(8080)

