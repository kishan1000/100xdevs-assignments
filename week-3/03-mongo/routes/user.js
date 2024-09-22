const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");

// User Routes
router.post('/signup', async (req, res) => {
    // Implement user signup logic

    console.log("route: POST /user/signup");

    const uname = req.body.username;
    const pass = req.body.password;

    const userExists = await User.findOne({ username: uname }).exec();
    if (userExists) {
        return res.status(400).json({ "msg": "Invalid username" });
    }

    const user = new User({
        username: uname,
        password: pass,
        courses: []
    });

    try {
        const savedUser = await user.save();
        return res.status(200).json({ "message": "User created successfully" });
    }
    catch (err) {
        console.log("Error while creating user", err);
        return res.status(500).json({ "msg": "internal server error" });
    }
});

router.get('/courses', async (req, res) => {
    // Implement listing all courses logic
    console.log("route: GET /user/courses");

    try {
        const courses = await Course.find();
        return res.status(200).json(courses);
    }
    catch (err) {
        console.log("Error while retriving all courses", err);
        return res.status(500).json({ "msg": "internal server error" });
    }
});

router.post('/courses/:courseId', userMiddleware, async (req, res) => {
    // Implement course purchase logic
    console.log("route: POST /user/courses/:courseId");

    const uname = req.headers.username;
    const courseId = req.params.courseId;

    let requestedCourse = undefined;
    try {
        requestedCourse = await Course.findOne({ _id: courseId });
        if (!requestedCourse) {
            return res.status(404).json({ "msg": "Course not found" });
        }
    }
    catch (err) {
        console.log("Error while requesting a course", err);
        return res.status(500).json({ "msg": "internal server error" });
    }

    let currentUser = undefined;
    try {
        currentUser = await User.findOne({ username: uname });
    }
    catch (err) {
        console.log("Error while requesting current user", err);
        return res.status(500).json({ "msg": "internal server error" });
    }

    currentUser.courses.push(requestedCourse._id);
    try {
        const savedUser = await currentUser.save();
        return res.status(200).json({ "message": "Course purchased successfully" });
    }
    catch (err) {
        console.log("Error while creating user", err);
        return res.status(500).json({ "msg": "internal server error" });
    }
});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    console.log("route: GET /user/purchasedCourses");

    const uname = req.headers.username;

    let currentUser = undefined;
    try {
        currentUser = await User.findOne({ username: uname });
        if (!currentUser) {
            return res.status(404).json({ "msg": "user not found" });
        }
    }
    catch (err) {
        console.log("Error while requesting current user", err);
        return res.status(500).json({ "msg": "internal server error" });
    }

    const purchasedCourses = [];
    const courses = currentUser.courses;
    for (let i = 0; i < courses.length; i++) {
        try{
            const course = await Course.findById(courses[i]);
            if(course){
                purchasedCourses.push(course);
            }
            else{
                continue;
            }
        }
        catch (err){
            console.log("Error while looking for courses");
            return res.status(500).json({ "msg": "internal server error" });
        }
    }

    return res.status(200).json({ "purchasedCourses": purchasedCourses });
});

module.exports = router