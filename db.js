const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("topSights-database.db")

// create  database tables
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

exports.getTotalItems = function(callback){
	
	const query = 'SELECT COUNT (*) AS count FROM sights'

  db.get(query, function(error, totalItems){
    callback(error, totalItems)
  })
}

exports.getAllSights = function(limit, offset, callback){
	
	const query = `SELECT * FROM sights LIMIT ? OFFSET ?`
  const values = [limit, offset]

  db.all(query, values, function(error, sights){
		callback(error, sights)
	})
}


exports.getSightById = function(id, callback){
  const query = `SELECT * FROM SIGHTS WHERE id = ?`
	const values = [id]

  db.get(query, values, function(error, sight){
    callback(error,sight)
  })
}

exports.deleteSightById = function(id, callback){
  const query = `DELETE FROM sights WHERE id = ?`
	const values = [id]

  db.run(query, values, function(error){
    callback(error)
  })
}

exports.createSight = function(name, city, country, info, image, callback){
  const query = `INSERT INTO sights (name, city, country, info, image) VALUES (?, ?, ?, ?, ?)`
	const values = [name, city, country, info, image]

  db.run(query, values, function(error){
    callback(error)
  })
}

exports.updateSightByIdWithoutNewImage = function(name, city, country, info, id, callback){
  const query = `UPDATE sights SET name = ?, city = ?, country = ?, info = ?  WHERE id = ?`
  const values = [name, city, country, info, id]
  db.run(query, values, function(error){
    callback(error)
  })
}

exports.updateSightByIdWithNewImage = function(name, city, country, info, image, id, callback){
  const query = `UPDATE sights SET name = ?, city = ?, country = ?, info = ?, image = ? WHERE id = ?`
  const values = [name, city, country, info, image, id]
  db.run(query, values, function(error){
    callback(error)
  })
}

exports.getSightsByFiltering = function(name, city, country, callback){
  let query = ""
	const values = []
	if(name =="" && city == "" && country == ""){
		query =`SELECT * FROM sights`
}else if(name ==""  && city == "" && country != ""){
	 query = `SELECT * FROM sights WHERE country = ?`
	 values.push(country)
	}else	if(name != "" && city ==""  && country == ""){
		 query = `SELECT * FROM sights WHERE name = ?`
		values.push(name)
	}else	if(name =="" && city != "" && country == ""){
		 query = `SELECT * FROM sights WHERE city = ?`
		values.push(city)
	}else	if(name =="" && city != "" && country != "" ){
		query = `SELECT * FROM sights WHERE city = ? AND country = ?`
		values.push(city)
		values.push(country)
	 }else if(name != "" && city == "" && country != ""){
		query = `SELECT * FROM sights WHERE name = ? AND country = ?`
		values.push(name)
		values.push(country)
	 }else if(name != "" && city !="" && country ==""  ){
		query = `SELECT * FROM sights WHERE name = ? AND city = ?`
		values.push(name)
		values.push(city)
	 }else if(name !="" && city != "" && country != ""){
		query = `SELECT * FROM sights WHERE name = ? AND city = ? AND country = ?`
		values.push(name)
		values.push(city)
		values.push(country)
 } 

 db.all(query, values, function(error, sights){
  callback(error, sights)
 })
}

exports.getAllFaqs = function(callback){
	
	const query = `SELECT * FROM faqs`

  db.all(query, function(error, faqs){
		callback(error, faqs)
	})
}

exports.createFaq = function(question, answer, callback){
  const query = `INSERT INTO faqs (question, answer) VALUES (?, ?)`
  const values = [question, answer]

  db.run(query, values, function(error){
    callback(error)
  })
}

exports.deleteFaqById = function(id, callback){
  const query = `DELETE FROM faqs WHERE id = ?`
	const values = [id]

  db.run(query, values, function(error){
    callback(error)
  })
}

exports.updateFaqById = function(question, answer, id, callback){
  const query = `UPDATE faqs SET question = ?, answer = ? WHERE id = ?`
		const values = [question, answer, id]
  db.run(query, values, function(error){
    callback(error)
  })
}

exports.getFaqById = function(id, callback){
  const query = `SELECT * FROM faqs WHERE id = ?`
	const values = [id]

  db.get(query, values, function(error, faq){
    callback(error,faq)
  })
}

exports.getAllComments = function(callback){
	
	const query = `SELECT * FROM comments`

  db.all(query, function(error, comments){
		callback(error, comments)
	})
}

exports.createComment = function(author, topic, text, rating, callback){
  const query = `INSERT INTO comments (author, topic, text, rating) VALUES (?, ?, ?, ?)`
  const values = [author, topic, text, rating]

  db.run(query, values, function(error){
    callback(error)
  })
}

exports.getCommentById = function(id, callback){
  const query = `SELECT * FROM comments WHERE id = ?`
	const values = [id]

  db.get(query, values, function(error, comment){
    callback(error,comment)
  })
}

exports.updateCommentById = function(author, topic, text, rating, id, callback){
  const query = `UPDATE comments SET author = ?, topic = ?, text = ?, rating = ? WHERE id = ?`
	const values = [author, topic, text, rating, id]
  db.run(query, values, function(error){
    callback(error)
  })
}

exports.deleteCommentById = function(id, callback){
  const query = `DELETE FROM comments WHERE id = ?`
	const values = [id]

  db.run(query, values, function(error){
    callback(error)
  })
}