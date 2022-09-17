const express = require('express')
const expressHandlebars = require('express-handlebars')
const data = require('./data.js')
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
	const model = {
		sights: data.sights
	}
		response.render('sights.hbs', model)
})

app.get("/sights/create", function(request, response){
	response.render("create-sight.hbs")
})

app.get('/faq', function (request, response) {
	const model = {
		faq: data.faq
	}
	response.render('faq.hbs', model)
})

app.get("/faq/create", function(request, response){
	response.render("create-faq.hbs")
})

app.post("/sights/create", function(request, response){	
	const question = request.body.question
	const answer = request.body.answer
	data.faq.push({
		id: data.faq.at(-1).id + 1,
		question: question,
		answer: answer
	})	
	response.redirect("/faq")	
})

app.post("/faq/delete/:id", function(request, response){
	const id = request.params.id
	const faqIndex = data.faq.findIndex(
		f => f.id  == id
	)
	data.faq.splice(faqIndex, 1)
	response.redirect("/faq")
	
})

app.get("/faq/update/:id", function (request, response) {
	const id = request.params.id
	const faq = data.faq.find(s => s.id == id)
	const model = {
		faq: faq
	}
	response.render('update-faq.hbs', model)
})

app.post("/faq/update/:id", function(request, response){
	const id = request.params.id
	const newQuestion = request.body.question
	const newAnswer = request.body.answer
	const faq = data.faq.find(s => s.id == id)
	faq.question = newQuestion
	faq.answer = newAnswer
	response.redirect("/faq")
	
})

app.post("/comments", function(request, response){	
	const author = request.body.author
	const headline = request.body.headline
	const comment = request.body.comment
	const rating = request.body.rating
	data.comments.push({
		id: data.comments.at(-1).id + 1,
		author: author,
		headline: headline,
		comment: comment,
		rating: rating
	})	
	response.redirect("/comments")	
})

app.get('/comments', function (request, response) {
	const model = {
		comments: data.comments
	}
	response.render('comments.hbs', model)
})

app.get("/comment/update/:id", function (request, response) {
	const id = request.params.id
	const comment = data.comments.find(c => c.id == id)
	const model = {
		comment: comment
	}
	response.render('update-comment.hbs', model)
})

app.post("/comment/update/:id", function(request, response){
	const id = request.params.id
	const newAuthor = request.body.author
	const newHeadline = request.body.headline
	const newComment = request.body.comment
	const newRating = request.body.rating
	const comment = data.comments.find(c => c.id == id)
	comment.author = newAuthor
	comment.headline = newHeadline
	comment.comment = newComment
	comment.rating = newRating
	response.redirect("/comments")
})

app.post("/comment/delete/:id", function(request, response){
	const id = request.params.id
	const commentIndex = data.comments.findIndex(
		c => c.id  == id
	)
	data.comments.splice(commentIndex, 1)
	response.redirect("/comments")
	
})

app.post("/sights/create", function(request, response){	
	const name = request.body.name
	const location = request.body.location
	const info = request.body.info
	data.sights.push({
		id: data.sights.at(-1).id + 1,
		name: name,
		location: location,
		info: info
	})	
	response.redirect("/sights")	
})

app.post("/sight/delete/:id", function(request, response){
	const id = request.params.id
	const sightIndex = data.sights.findIndex(
		s => s.id  == id
	)
	data.sights.splice(sightIndex, 1)
	response.redirect("/sights")
	
})

app.get("/sight/update/:id", function (request, response) {
	const id = request.params.id
	const sight = data.sights.find(s => s.id == id)
	const model = {
		sight: sight
	}
	response.render('update-sight.hbs', model)
})

app.post("/sight/update/:id", function(request, response){
	const id = request.params.id
	const newName = request.body.name
	const newLocation = request.body.location
	const newInfo = request.body.info
	const sight = data.sights.find(s => s.id == id)
	sight.name = newName
	sight.location = newLocation
	sight.info = newInfo
	response.redirect("/sights")
	
})

app.get("/sights/:id", function (request, response) {
	const id = request.params.id
	const sight = data.sights.find(s => s.id == id)
	const model = {
		sight: sight
	}
	response.render('sight.hbs', model)
})

app.listen(8080)

