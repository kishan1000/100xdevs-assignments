const { Admin } = require("../db");

// Middleware for handling auth
async function adminMiddleware(req, res, next) {
    // Implement admin auth logic
    // You need to check the headers and validate the admin from the admin DB. Check readme for the exact headers to be expected

    console.log("route: Middleware /adminMiddleware");

    const username = req.headers.username;
    const password = req.headers.password;


    const result = await Admin.findOne({username : username, password : password});

    if(result){
        next();
    }
    else{
        return res.status(401).json({"msg" : "Invalid credentials"});
    }
}

module.exports = adminMiddleware;