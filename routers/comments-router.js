const express = require('express')
const db = require('../db.js')
const router = express.Router()

module.exports = router

// Const for comment input validation
const COMMENT_AUTHOR_MAX_LENGTH = 40
const COMMENT_TOPIC_MAX_LENGTH = 40
const COMMENT_TEXT_MAX_LENGTH = 40
const COMMENT_RATING_MAX_NUMBER = 10

//detect input error for comments
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

	}else if(rating == 0){

		errorMessages.push("Rating may not be 0")

	}else if(COMMENT_RATING_MAX_NUMBER < rating){

		errorMessages.push("Rating may at most be 10")
		
	}

	return errorMessages

}

//GET /comments
router.get('/', function (request, response) {	

	const errorMessages = []

	db.getAllComments(function(error, comments){

		if(error){
							
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				comments,
				operation: "get"
			}

			response.render('comments.hbs', model)

		}else{

			const model = {
				errorMessages,
				comments,
				operation: "get"
			}

			response.render('comments.hbs', model)

		}

	})
})

//GET /comments/create
router.get("/create", function(request, response){

	response.render("create-comment.hbs")

})

//POST /comments/create
router.post("/create", function(request, response){	

	const author = request.body.author
	const topic = request.body.topic
	const text = request.body.text
	const rating = parseInt(request.body.rating)

	const errorMessages = getValidationErrorsForComment(author, topic, text, rating)	

	if(errorMessages.length == 0){
		
		db.createComment(author, topic, text, rating, function(error){

			if(error){
				
				errorMessages.push("Internal server error")
	
				const model = {
					errorMessages,
					author,
					topic,
					text,
					rating,
					operation: "create"
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
			rating,
			operation: "create"
		}

		response.render('create-comment.hbs', model)

	}
})

//GET /comments/update/1 /comments/update/2
router.get("/update/:id", function (request, response) {

	const id = request.params.id
	
	const errorMessages = []

	db.getCommentById(id, function(error, comment){

		if(error){
				
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				comment,
				operation: "get"
			}

			response.render('update-comment.hbs', model)

		}else{

			const model = {
				errorMessages,
				comment,
				operation: "get"
			}

			response.render('update-comment.hbs', model)

		}
	})	
})

//POST /comments/update/1 /comments/update/2
router.post("/update/:id", function(request, response){

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

		db.updateCommentById(newAuthor, newTopic, newText, newRating, id, function(error){

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
						},
						operation: "update"
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
				},
				operation: "update"

		}

		response.render('update-comment.hbs', model)

	}
})

//POST /comments/delete/1 /comments/delete/2
router.post("/delete/:id", function(request, response){

	const id = request.params.id	

	const errorMessages = []

	if(!request.session.isLoggedIn){

		errorMessages.push('You are not logged in')

	}

	if(errorMessages.length == 0){
	
		db.deleteCommentById(id, function(error){

			if(error){
					
				errorMessages.push("Internal server error")

				const model = {
					errorMessages,
					pagePath: "/comments",
					pageName: "comments",
					deleteErrorFor: "comment",
					operation: "delete"
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
			deleteErrorFor: "comment",
			operation: "delete"
		}

		response.render('delete-error.hbs', model)

	}	
})