const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Book = require('./lib/models/book.js')
const BooksController = require('./lib/controllers/books_controller.js')

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('port', process.env.PORT || 3000)
app.locals.title = "Bookchain API"

app.get('/api/v1/books', BooksController.index)
app.get('/api/v1/books/:name', BooksController.show)
app.post('/api/v1/books', BooksController.post)
app.put('/api/v1/books/:name', BooksController.update)
app.delete('/api/v1/books/:name', BooksController.destroy)

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}.`);
  });
}

module.exports = app;
