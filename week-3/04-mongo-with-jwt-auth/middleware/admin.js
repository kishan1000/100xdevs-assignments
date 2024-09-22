// Middleware for handling auth
require("dotenv").config();
const jwt = require("jsonwebtoken");

function adminMiddleware(req, res, next) {
    // Implement admin auth logic
    // You need to check the headers and validate the admin from the admin DB. Check readme for the exact headers to be expected
    console.log("route: Middleware /adminMiddleware");

    const authorization = req.header.authorization;

    if (!authorization) {
        return res.status(401).json({ message: "Authorization error" });
    }

    if (!authorization.startsWith('Bearer')) {
        return res.status(401).json({ message: "Bearer error" });
    }

    let token;
    try {
        token = authorization.split(' ')[1];
    } catch (err) {
        return res.status(500).send({ message: 'Internal server error' });
    }

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    let isValid;
    try {
        isValid = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
        return res.status(500).send({ message: 'Internal server error' });
    }
    req.headers.username = isValid.username;
    next();
}

module.exports = adminMiddleware;