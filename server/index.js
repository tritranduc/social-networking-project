import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import cors from 'cors'

import auth from './router/auth.js'

import connectDB from './db.js'
import post from './router/post.js'
import comment from './router/comment.js'
import upload from './middleware/uploadFile.js'
import validation from './middleware/validation.js'

import fs from 'fs'
var dir = './public/uploads'

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

var app = express()
connectDB()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(cors())
app.use(express.static('./public'))
app.use(upload.array('attachment'))
app.use(validation)

app.use('/auth', auth)
app.use('/post', post)
app.use('/comment', comment)

var port = process.env.PORT || 8000
var server = http.createServer(app)
server.listen(port, () => {
  console.log(`app is listen in port : ${port}`)
})
