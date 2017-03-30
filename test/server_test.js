const assert = require('chai').assert;
const app = require('../server');
const request = require('request');
const Book = require('../lib/models/book.js')

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('Server', () => {
  before((done) => {
    this.port = 9876;
    this.server = app.listen(this.port, (err, result) => {
      if (err) { done(err) }
      done();
    })

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876'
    })
  })

  after(() => {
    this.server.close()
  })

  it('exists', () => {
    assert(app);
  });

  describe('GET /api/v1/books', () => {

    beforeEach(done => {
      Promise.all([
        Book.create("Mark", "Twain", "Fiction", "Adventure"),
        Book.create("Sandy", "Mentz", "Non-fiction", "Ruby")
      ]).then(() => done())
    })

    afterEach(done => {
      Book.deleteAll()
        .then(() => done());
    })

    it('returns all books', done => {
      this.request.get('/api/v1/books', (error, response) => {
        if (error) { done(error); }
        const books = JSON.parse(response.body)

        assert.equal(books.length, 2)
        assert.equal(books[0].author_first_name, "Mark")
        assert.equal(books[0].author_last_name, "Twain")
        assert.equal(books[0].type, "Fiction")
        assert.equal(books[0].category, "Adventure")
        assert.equal(books[1].author_first_name, "Sandy")
        assert.equal(books[1].author_last_name, "Mentz")
        assert.equal(books[1].type, "Non-fiction")
        assert.equal(books[1].category, "Ruby")
        done();
      })
    })

    it('returns 200', done => {
      this.request.get('/api/v1/books', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200)
        done();
      })
    })
  });

  describe('GET /api/v1/books/:name', () => {

    beforeEach(done => {
      Promise.all([
        Book.create("Mark", "Twain", "Fiction", "Adventure"),
        Book.create("Sandy", "Mentz", "Non-fiction", "Ruby")
      ]).then(() => done())
    })

    afterEach(done => {
      Book.deleteAll()
        .then(() => done());
    })

    it('returns the correct book', (done) => {
      this.request.get('/api/v1/books/1', (error, response) => {
        if (error) { done(error); }
        const book = JSON.parse(response.body)

        assert.equal(book.author_first_name, "Mark")
        assert.equal(book.author_last_name, "Twain")
        assert.equal(book.type, "Fiction")
        assert.equal(book.category, "Adventure")
        done();
      })
    })

    it('returns 200 if the book exists', done => {
      this.request.get('/api/v1/books/1', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      })
    })

    it('returns 404 if the book does not exist', done => {
      this.request.get('/api/v1/books/3', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 404)
        done();
      })
    })
  });

  describe('POST /api/v1/books', () => {
    beforeEach(done => {
      Book.deleteAll()
        .then(() => done())
    })

    afterEach(done => {
      Book.deleteAll()
        .then(() => done())
    })

    it('receives and stores data', done => {
      const book = { author_first_name: 'Mark', author_last_name: 'Twain', type: "Fiction", category: "Adventure" }
      this.request.post('/api/v1/books', { form: book }, (error, response) => {
        if (error) { done(error) }
        Book.findById(1)
          .then((data) => {
            const id = data.rows[0].id
            assert.equal(id, book.id)
            const author_first_name = data.rows[0].author_first_name
            assert.equal(author_first_name, book.author_first_name)
          }).then(() => done())
      })
    })

    it('returns 201 if it succeeds', done => {
      const book = { author_first_name: 'Mark', author_last_name: 'Twain', type: "Fiction", category: "Adventure" }
      this.request.post('/api/v1/books', { form: book }, (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 201)
        done();
      })
    })

    it('returns 422 if it fails', done => {
      const badBook = { author_first_name: 'Mark' }
      this.request.post('/api/v1/books', { form: badBook }, (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 422)
        done();
      })
    })
  })

  describe('PUT /api/v1/books/:id', () => {
    beforeEach(done => {
      Promise.all([
        Book.create("Mark", "Twain", "Fiction", "Adventure"),
        Book.create("Sandy", "Mentz", "Non-fiction", "Ruby")
      ]).then(() => done())
    })

    afterEach(done => {
      Book.deleteAll()
        .then(() => done());
    })

    it('updates the book', done => {
      const updatedBook = { author_first_name: 'Marcus', author_last_name: 'Twain', type: "Fiction", category: "Adventure" }
      this.request.put('/api/v1/books/1', { form: updatedBook } , (error, response) => {
        if (error) { done(error) }
        // test that it returns the correct book in the response
        const book = JSON.parse(response.body)
        assert.equal(book.author_first_name, "Marcus")
        assert.equal(book.author_last_name, "Twain")

        // test that it updated the database correctly
        Book.findById(1)
          .then((data) => {
            const rows = data.rows
            const book = rows[0]
            assert.equal(rows.length, 1)
            assert.equal(book.author_first_name, "Marcus")
            assert.equal(book.author_last_name, "Twain")
            assert.equal(book.type, "Fiction")
            assert.equal(book.category, "Adventure")
          }).then(() => done())
      })
    })

    it('does not change other books', done => {
      const updatedBook = { author_first_name: 'Marcus', author_last_name: 'Twain', type: "Fiction", category: "Adventure" }
      this.request.put('/api/v1/books/1', { form: updatedBook } , (error, response) => {
        if (error) { done(error) }

        Book.findById(2)
          .then((data) => {
            const book = data.rows[0]
            assert.equal(book.author_first_name, "Sandy")
            assert.equal(book.author_last_name, "Mentz")
            assert.equal(book.type, "Non-fiction")
            assert.equal(book.category, "Ruby")
          })
          .then(() => done())
      })
    })

    it('returns a 204 if it succeeds', done => {
      const updatedBook = { author_first_name: 'Marcus', author_last_name: 'Twain', type: "Fiction", category: "Adventure" }
      this.request.put('/api/v1/books/1', { form: updatedBook } , (error, response) => {
        if (error) { done(error) }

        assert.equal(response.statusCode, 204)
        done()
      })
    })

    it('returns a 404 if the book does not exist', done => {
      const updatedBook = { author_first_name: 'Marcus', author_last_name: 'Twain', type: "Fiction", category: "Adventure" }
      this.request.put('/api/v1/books/foo', { form: updatedBook } , (error, response) => {
        if (error) { done(error) }

        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it('returns a 422 if the book is not in the correct format', done => {
      const updatedBook = { author_first_name: 'Marcus' }
      this.request.put('/api/v1/books/1', { form: badBook } , (error, response) => {
        if (error) { done(error) }

        assert.equal(response.statusCode, 422)
        done()
      })
    })
  })

  describe('DELETE /api/v1/books/:id', () => {
    beforeEach(done => {
      Promise.all([
        Book.create("Mark", "Twain", "Fiction", "Adventure"),
        Book.create("Sandy", "Mentz", "Non-fiction", "Ruby")
      ]).then(() => done())
    })

    afterEach(done => {
      Book.deleteAll()
        .then(() => done());
    })

    it('deletes the correct book', done => {
      this.request.delete('/api/v1/books/1', (error, response) => {
        if (error) { done(error) }
        Book.all()
          .then((data) => {
            const rows = data.rows
            assert.equal(rows.length, 1)
            assert.equal(rows[0].author_first_name, "Sandy")
          })
          .then(() => done())
      })
    })

    it('returns 204 if it succeeds', done => {
      this.request.delete('/api/v1/books/1', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 204)
        done()
      })
    })

    it('returns 404 if the book does not exist', done => {
      this.request.delete('/api/v1/books/foo', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 404)
        done()
      })
    })
  })

});
