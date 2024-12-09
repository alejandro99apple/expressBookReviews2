const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];


const doesExist = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/customer/login", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (doesExist(username)) {

      const user = users.find(user => user.username === username);

      if (user && user.password === password) { // Verificar que el usuario existe antes de acceder a la contraseña
        const token = jwt.sign({data: password}, 'access', { expiresIn: 60 * 60 });
        if (!req.session) {
          req.session = {}; // Asegurarse de que req.session esté definido
        }
        req.session.token = token; // Guardar el token en la sesión directamente
        req.session.username = username;
        return res.status(200).json({ message: "Login successful"});
      } else {
        return res.status(403).json({ message: "Invalid password" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  }
  return res.status(400).json({ message: "Username and password required" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.query.review;
  const isbn = req.params.isbn;
  const username = req.session && req.session.username; // Usar la variable global para acceder a username

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" }); // Verificar si el usuario está autenticado
  }

  if (!books[isbn].reviews[username]) {
    // Si el usuario no ha dejado una reseña antes, la agregamos
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added successfully to: ", bookTitle: books[isbn].title, bookISBN: isbn });
  } else {
    // Si el usuario ya dejó una reseña, la modificamos
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  }

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session && req.session.username; // Usar la variable global para acceder a username

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" }); // Verificar si el usuario está autenticado
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  // Eliminar la reseña del usuario
  const bookTitle = books[isbn].title; // Obtener el título del libro
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully from:", bookTitle: bookTitle });
});


regd_users.get("/info", (req, res) => {
  const sessionDetails = {
      username: req.username,
      token: req.session.token,
      sessionID: req.sessionID,
      createdAt: req.session.createdAt,
      updatedAt: req.session.updatedAt
  };
  return res.status(200).json({ message: "Detalles de la sesión", sessionDetails });
});

module.exports.authenticated = regd_users;
module.exports.doesExist = doesExist;
module.exports.users = users;
