const express = require('express')
const expressHandlebars = require('express-handlebars')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database("topSights-database.db")

db.run(`
	CREATE TABLE IF NOT EXISTS sights   (
		id INTEGER PRIMARY KEY,
		name TEXT,
		city TEXT,
		country TEXT,
		info TEXT 
	)`
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
	express.urlencoded({
		extended: false
	})
)

app.get('/', function (request, response) {
	response.render('start.hbs')
})

app.get('/about', function (request, response) {
	response.render('about.hbs')
})

app.get('/contact', function (request, response) {
	response.render('contact.hbs')
})

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

app.get('/faqs', function (request, response) {
	const query = `SELECT * FROM faqs`
	db.all(query, function(error, faqs){
		const model = {
			faqs
		}
		response.render('faqs.hbs', model)
	})	
})

app.get("/faq/create", function(request, response){
	response.render("create-faq.hbs")
})

app.post("/faq/create", function(request, response){	
	const question = request.body.question
	const answer = request.body.answer

	const query = `INSERT INTO faqs (question, answer) VALUES (?, ?)`
	const values = [question, answer,]
	db.run(query, values, function(error){
		response.redirect("/faqs")	
	})
})

app.post("/faq/delete/:id", function(request, response){
	const id = request.params.id
	const query = `DELETE FROM faqs WHERE id = ?`
	const values = [id]
	
	db.run(query, values, function(error){
		response.redirect("/faqs")
	})	
	
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
	
	const query = `UPDATE faqs SET question = ?, answer = ? WHERE id = ?`
	const values = [newQuestion, newAnswer, id]
	db.run(query, values, function(error){
		response.redirect("/faqs")
	})
})

app.post("/comments/create", function(request, response){	
	const author = request.body.author
	const topic = request.body.topic
	const text = request.body.text
	const rating = request.body.rating

	const query = `INSERT INTO comments (author, topic, text, rating) VALUES (?, ?, ?, ?)`
	const values = [author, topic, text, rating]
	db.run(query, values, function(error){
		response.redirect("/comments")	
	})
})

app.get('/comments', function (request, response) {
	const query = `SELECT * FROM comments`
	db.all(query, function(error, comments){
		const model = {
			comments
		}
		response.render('comments.hbs', model)
	})
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

	const query = `UPDATE comments SET author = ?, topic = ?, text = ?, rating = ? WHERE id = ?`
	const values = [newAuthor, newTopic, newText, newRating, id]
	db.run(query, values, function(error){
		response.redirect("/comments")
	})
})

app.post("/comment/delete/:id", function(request, response){
	const id = request.params.id
	const query = `DELETE FROM comments WHERE id = ?`
	const values = [id]
	
	db.run(query, values, function(error){
		response.redirect("/comments")
	})	
	
})

app.post("/sights/create", function(request, response){	
	const name = request.body.name
	const city = request.body.city
	const country = request.body.country
	const info = request.body.info

	const query = `INSERT INTO sights (name, city, country, info) VALUES (?, ?, ?, ?)`
	const values = [name, city, country, info]
	db.run(query, values, function(error){
		response.redirect("/sights")	
	})
})

app.post("/sight/delete/:id", function(request, response){
	const id = request.params.id
	const query = `DELETE FROM sights WHERE id = ?`
	const values = [id]
	
	db.run(query, values, function(error){
		response.redirect("/sights")
	})	
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

app.post("/sight/update/:id", function(request, response){
	const id = request.params.id
	const newName = request.body.name
	const newCity = request.body.city
	const newCountry = request.body.country
	const newInfo = request.body.info

	const query = `UPDATE sights SET name = ?, city = ?, country = ?, info = ? WHERE id = ?`
	const values = [newName, newCity, newCountry, newInfo, id]
	db.run(query, values, function(error){
		response.redirect("/sights")
	})
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

app.listen(8080)

