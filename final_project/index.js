const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const authenticated = require('./router/auth_users.js').authenticated

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
const token = req.session.token; // Obtener el token de la sesión
if (!token) {
    return res.status(403).json({ message: "No autenticado" }); // Si no hay token, el usuario no está autenticado
}

jwt.verify(token, 'access', (err, decoded) => {
    if (err) {
        return res.status(403).json({ message: "Token inválido" }); // Si el token no es válido, denegar acceso
    }
    req.username = decoded.username; // Almacenar el nombre de usuario decodificado en la solicitud
    next(); // Continuar con la siguiente función de middleware
});
});


app.get("/customer/info", (req, res) => {
    const sessionDetails = {
        username: req.username,
        token: req.session.token,
        sessionID: req.sessionID,
        createdAt: req.session.createdAt,
        updatedAt: req.session.updatedAt
    };
    return res.status(200).json({ message: "Detalles de la sesión", sessionDetails });
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.use("/",authenticated )

app.listen(PORT,()=>console.log("Server is running"));
