const express = require('express')
const db = require('../db.js')
const router = express.Router()

module.exports = router

// Const for faq input validation
const FAQ_QUESTION_MAX_LENGTH = 100
const FAQ_ANSWER_MAX_LENGTH = 250

//detect input errors for faqs
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

//GET /faqs
router.get('/', function (request, response) {

	const errorMessages = []

	db.getAllFaqs(function(error, faqs){

		if(error){
				
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				faqs,
				operation: "get"
			}

			response.render('faqs.hbs', model)

		}else{

			const model = {
				errorMessages,
				faqs,
				operation: "get"
			}

			response.render('faqs.hbs', model)

		}

	})	
})

//GET /faqs/create
router.get("/create", function(request, response){

	response.render("create-faq.hbs")

})

//POST /faqs/create
router.post("/create", function(request, response){	

	const question = request.body.question
	const answer = request.body.answer

	const errorMessages = getValidationErrorsForFaq(question, answer)

	if(!request.session.isLoggedIn){

		errorMessages.push('You are not logged in')

	}

	if(errorMessages.length == 0){
		
		db.createFaq(question, answer, function(error){

			if(error){
				
				errorMessages.push("Internal server error")
	
				const model = {
					errorMessages,
					question,
					answer,
					operation: "create"
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
			answer,
			operation: "create"
		}
		
		response.render('create-faq.hbs', model)

	}
})

//POST /faqs/delete/1 /faqs/delete/2
router.post("/delete/:id", function(request, response){

	const id = request.params.id

	const errorMessages = []

	if(!request.session.isLoggedIn){

		errorMessages.push('You are not logged in')

	}

	if(errorMessages.length == 0){
	
		db.deleteFaqById(id, function(error){

			if(error){
					
				errorMessages.push("Internal server error")

				const model = {
					errorMessages,
					pagePath: "/faqs",
					pageName: "faqs",
					deleteErrorFor: "faq",
					operation: "delete"
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
			deleteErrorFor: "faq",
			operation: "delete"
		}

		response.render('delete-error.hbs', model)

	}	
})

//GET /faqs/update/1 faqs/update/2
router.get("/update/:id", function (request, response) {

	const id = request.params.id
	
	const errorMessages = []

	db.getFaqById(id, function(error, faq){

		if(error){
				
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				faq,
				operation: "get"
			}

			response.render('update-faq.hbs', model)

		}else{

			const model = {
				errorMessages,
				faq,
				operation: "get"
			}

			response.render('update-faq.hbs', model)

		}
	})	
})

//POST /faqs/update/1 faqs/update/2
router.post("/update/:id", function(request, response){

	const id = request.params.id
	const newQuestion = request.body.question
	const newAnswer = request.body.answer

	const errorMessages = getValidationErrorsForFaq(newQuestion, newAnswer)

	if(!request.session.isLoggedIn){

		errorMessages.push('You are not logged in')

	}

	if(errorMessages.length == 0){	
		
		db.updateFaqById(newQuestion, newAnswer, id, function(error){

			if(error){
					
				errorMessages.push("Internal server error")

				const model = {
					errorMessages,
					faq: {
						id,
						question: newQuestion,
						answer: newAnswer,
						},
						operation: "update"
					}

				response.render('update-faq.hbs', model)

			}else{

				response.redirect("/faqs")

			}			
		}) 

	}else{
		const model= {
			errorMessages,
					faq: {
						id,
						question: newQuestion,
						answer: newAnswer,
						},
						operation: "update"
		}

		response.render('update-faq.hbs', model)
	
	}
})
