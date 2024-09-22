const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const { Admin, Course } = require("../db");
const router = Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");

// Admin Routes
router.post('/signup', async (req, res) => {
    // Implement admin signup logic
    console.log("route: POST /admin/signup");

    const uname = req.body.username;
    const pass = req.body.password;

    const adminExists = await Admin.findOne({ username: uname }).exec();
    if (adminExists) {
        return res.status(400).json({ "msg": "Invalid username" });
    }

    const admin = new Admin({
        username: uname,
        password: pass
    });

    try {
        const savedAdmin = await admin.save();
        return res.status(200).json({ "message": "Admin created successfully" });
    }
    catch (err) {
        console.log("Error while creating admin", err);
        return res.status(500).json({ "msg": "internal server error" });
    }
});

router.post('/signin', async (req, res) => {
    // Implement admin signup logic
    const { username, password } = req.headers;

    try {
        // Find the user by username
        const IsValidAdmin = await Admin.findOne({ username: username });

        if (!IsValidAdmin) {
            return res.status(404).send({ message: 'Admin not found' });
        }

        // Check if the password matches
        const isPasswordCorrect = IsValidAdmin.password === password; // Ideally, you'd hash the password and compare

        if (!isPasswordCorrect) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        // Success
        const token = jwt.sign({ username }, process.env.JWT_SECRET_KEY);

        return res.status(200).send({ token });

    } catch (err) {
        // Handle any errors
        // console.error(err);
        return res.status(500).send({ message: 'Internal server error' });
    }
});

router.post('/courses', adminMiddleware, async (req, res) => {
    // Implement course creation logic
    // Body: { title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com' }

    console.log("route: POST /admin/courses");

    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const imageLink = req.body.imageLink;
    let published = req.body.published;
    if (!published) published = true;

    const course = new Course({
        title: title,
        description: description,
        price: price,
        imageLink: imageLink,
        published: published
    });

    try {
        const savedCourse = await course.save();
        return res.status(200).json({ message: 'Course created successfully', courseId: savedCourse._id });
    }
    catch (err) {
        console.log("Error while creating course", err);
        return res.status(500).json({ "msg": "internal server error" });
    }
});

router.get('/courses', adminMiddleware, async (req, res) => {
    // Implement fetching all courses logic
    console.log("route: GET /admin/courses");
    try {
        const courses = await Course.find();
        return res.status(200).json(courses);
    }
    catch (err) {
        console.log("Error while retriving all courses", err);
        return res.status(500).json({ "msg": "internal server error" });
    }
});

module.exports = router;