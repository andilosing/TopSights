const express = require('express')

const router = express.Router()
// const db = reqiure('../db')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("topSights-database.db")

module.exports = router

