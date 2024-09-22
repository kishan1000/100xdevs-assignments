require("dotenv").config();
const jwt = require("jsonwebtoken");

function userMiddleware(req, res, next) {
    // Implement user auth logic
    // You need to check the headers and validate the user from the user DB. Check readme for the exact headers to be expected
    console.log("route: Middleware /userMiddleware");

    const authorization = req.headers.authorization;

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
        return res.status(401).send({ message: 'Invalid token' });
    }
    req.headers.username = isValid.username;
    next();
}

module.exports = userMiddleware;