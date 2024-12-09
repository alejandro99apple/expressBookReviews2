const express = require('express');
let books = require("./booksdb.js");
let doesExist = require("./auth_users.js").doesExist;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Route to handle user registration
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user."});
});



// Get books using Promises----------------------------------------------------
public_users.get('/', async function (req, res) {
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms
    return res.status(200).json({ books: books });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener la lista de libros" });
  }
});


// Get book details based on ISBN ASYNC
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      const foundBook = books[isbn];
      if (foundBook) {
        resolve(foundBook);
      } else {
        reject("Book not found");
      }
    });
    return res.status(200).json({ book: book });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});
  
// Get book details based on the author ASYNC
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found for this author");
      }
    });
    return res.status(200).json({ books: booksByAuthor });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get all books by title ASYNC
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found with this title");
      }
    });
    return res.status(200).json({ books: booksByTitle });
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && Object.keys(book.reviews).length > 0) {
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
