const { User } = require("../db");

async function userMiddleware(req, res, next) {
    // Implement user auth logic
    // You need to check the headers and validate the user from the user DB. Check readme for the exact headers to be expected

    console.log("route: Middleware /userMiddleware");

    const username = req.headers.username;
    const password = req.headers.password;

    const result = await User.findOne({username : username, password : password}).exec();

    if(result){
        next();
        return;
    }

    return res.status(401).json({"msg" : "Invalid credentials"});
}

module.exports = userMiddleware;