const express = require('express')
const db = require('../db.js')
const router = express.Router()

const multer = require('multer')
const upload = multer({
	storage:multer.memoryStorage(),
})

module.exports = router

// Const for sight input validation
const SIGHT_NAME_MAX_LENGTH = 40
const SIGHT_CITY_MAX_LENGTH = 40
const SIGHT_COUNTRY_MAX_LENGTH = 40
const SIGHT_INFO_MAX_LENGTH = 250

// Const for sight pagination page limit
const PAGINATION_PAGE_LIMIT = 2

// pagination
function paginate(currentSightPage, pageLimitForPagination, totalSightItems) {

	const totalSightPages = Math.ceil(totalSightItems / pageLimitForPagination)
	let previousPage
	let nextPage
	currentSightPage = parseInt(currentSightPage)

	if(currentSightPage <= 1) {

		currentSightPage = 1
		nextPage = totalSightPages > currentSightPage ? currentSightPage +1 : false
		previousPage = false

	} else if( currentSightPage >= totalSightPages){

		currentSightPage = totalSightPages
		previousPage = currentSightPage - 1
		nextPage = false

	} else {

		previousPage = currentSightPage - 1 
		nextPage = currentSightPage + 1
		
	}

	return{

		prevPage: previousPage, 
		currentPage: currentSightPage, 
		nextPage: nextPage,
		offset: (currentSightPage - 1) * pageLimitForPagination,
		limit: pageLimitForPagination

	}
}

//detect input errors for sights
function getValidationErrorsForSight(name, city, country, info, requestFile){

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

// Input validation for ulpoad an image
	if(requestFile == undefined){	

	}else{

		if(requestFile.mimetype == "image/jpg" || requestFile.mimetype == "image/png"  || requestFile.mimetype == "image/jpeg"){

			image = requestFile.buffer.toString('base64')

		}else{

			errorMessages.push("Image type must be .png, .jpg or .jpeg")	
			
		}
	}

	return errorMessages

}

//GET /sights
router.get('/', function (request, response) {

	const {page} = request.query
	const currentPage = !isNaN(page) ? page : 1	
	
	const errorMessages = []

	db.getTotalItems(function(error, totalItems){

		if (error) {

			errorMessages.push("Internal server error")
		
			const model = {
				errorMessages,
				sights,
				operation: "get"
			}

		} else {

			const pagination = paginate(currentPage, PAGINATION_PAGE_LIMIT,  totalItems.count)

			db.getAllSights(pagination.limit, pagination.offset, function(error, sights){

				if(error){

					errorMessages.push("Internal server error")
		
					const model = {
						errorMessages,
						sights,
						operation: "get"
					}
		
					response.render('sights.hbs', model)

				} else {

					const model = {
						errorMessages,
						pagination,
						sights,
						operation: "get"
					}

					response.render('sights.hbs', model)

				}
			})			 
		}
	})
})

//GET /sights/search
router.get('/search', function (request, response) {

	response.render('search-sights.hbs')

})

//POST /sights/search
router.post("/search", function(request, response){	

	let name = request.body.name
	let city = request.body.city
	let country = request.body.country
	
	const errorMessages = []	

	db.getSightsByFiltering(name, city, country, function(error, sights){

		if(error){

			errorMessages.push("Internal Server Error")

			const model = {
				sights,
				name,
				city,
				country,
				errorMessages,
				performedSearch: false
			}

			response.render('search-sights.hbs', model)

		}else{

			const model = {
				sights,
				name,
				city,
				country,
				errorMessages, 
				performedSearch: true	
			}	
			
			response.render('search-sights.hbs', model)

		}		
	})
})

//POST /sights/delete/1 /sights/delete/2
router.post("/delete/:id", function(request, response){

	const id = request.params.id

	const errorMessages = []

	if(!request.session.isLoggedIn){

		errorMessages.push('You are not logged in')

	}

	if(errorMessages.length == 0){
	
		db.deleteSightById(id, function(error){

			if(error){
					
				errorMessages.push("Internal server error")

				const model = {
					errorMessages,
					pagePath: "/sights",
					pageName: "sights",
					deleteErrorFor: "sight",
					operation: "delete"
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
			deleteErrorFor: "sight",
			operation: "delete"
		}

		response.render('delete-error.hbs', model)

	}
})

//GET /sights/update/1 /sights/update/2
router.get("/update/:id", function (request, response) {

	const id = request.params.id

	const errorMessages = []

	db.getSightById(id,  function(error, sight){

		if(error){
				
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				sight,
				operation: "get"
			}

			response.render('update-sight.hbs', model)

		}else{

			const model = {
				errorMessages,
				sight,
				operation: "get"
			}

			response.render('update-sight.hbs', model)
		}
	})		
})

//POST /sights/update/1 /sights/update/2
router.post("/update/:id", upload.single('image'), function(request, response){

	const id = request.params.id
	const newName = request.body.name
	const newCity = request.body.city
	const newCountry = request.body.country
	const newInfo = request.body.info

	const errorMessages = getValidationErrorsForSight(newName, newCity, newCountry, newInfo, request.file)

	if(!request.session.isLoggedIn){

		errorMessages.push('You are not logged in')

	}

	if(errorMessages.length == 0){

		//Update without a new image
		if(request.file == undefined){
		
			db.updateSightByIdWithoutNewImage(newName, newCity, newCountry, newInfo, id, function(error){
				
				if(error){
						
					errorMessages.push("Internal server error")
		
					const model = {
						errorMessages,
						sight: {
							id,
							name: newName,
							city: newCity,
							country: newCountry,
							info: newInfo,
							},
							operation: "update"
						}
		
					response.render('update-sight.hbs', model)

				}else{

					response.redirect("/sights")

				}			
			})

		//Update with a new image
		}else{

			newImage = request.file.buffer.toString('base64')

			db.updateSightByIdWithNewImage(newName, newCity, newCountry, newInfo, newImage, id, function(error){

				if(error){
					
					errorMessages.push("Internal server error")
		
					const model = {
						errorMessages,
						sight: {
							id,
							name: newName,
							city: newCity,
							country: newCountry,
							info: newInfo,
							},
							operation: "update"
						}
		
					response.render('update-sight.hbs', model)

				}else{

					response.redirect("/sights")

				}			
			})
		}

	}else{

		const model= {
			errorMessages,
			sight: {
				id,
				name: newName,
				city: newCity,
				country: newCountry,
				info: newInfo,
			} ,
			operation: "update"
		}

		response.render('update-sight.hbs', model)

	}
})

//GET /sights/create
router.get("/create", function(request, response){

	response.render("create-sight.hbs")

})

//POST /sights/create
router.post("/create", upload.single('image'), function(request, response){	

	const name = request.body.name
	const city = request.body.city
	const country = request.body.country
	const info = request.body.info
	let image = ""

	const errorMessages = getValidationErrorsForSight(name, city, country, info, request.file)

	if(!request.session.isLoggedIn){

		errorMessages.push('You are not logged in')

	}

	//Validation if image is empty
	if(request.file == undefined){

		errorMessages.push("Image cant be empty")	
	}

	
	if(errorMessages.length == 0){
	
		 image = request.file.buffer.toString('base64')
		 
		 db.createSight(name, city, country, info, image, function(error){
			
			if(error){
				
				errorMessages.push("Internal server error")

				const model = {
					errorMessages,
					name,
					city,
					country,
					info,
					image,
					operation: "create"
				}

				response.render('create-sight.hbs', model)
			
			}else{

			response.redirect("/sights")

			}			
		})

	}else{
		
		const model = {
			errorMessages,
			name,
			city,
			country,
			info,
			image,
			operation: "create"
		}
		
		response.render('create-sight.hbs', model)
		
	}
})

//GET /sights/1 /sights/2
router.get("/:id", function (request, response) {

	const id = request.params.id
	
	const errorMessages = []

	db.getSightById(id,  function(error, sight){

		if(error){
					
			errorMessages.push("Internal server error")

			const model = {
				errorMessages,
				sight,
				operation: "get"
			}

			response.render('sight.hbs', model)

		}else{

			const model = {
				errorMessages,
				sight,
				operation: "get"
			}

			response.render('sight.hbs', model)

		}
	})
})