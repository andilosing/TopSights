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

app.delete("/sight", function(request, response){
	const id = request.params.id
	
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

