// userRoute.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET request to retrieve all users
router.get('/users', userController.getAllUsers);

// POST request to insert a new user
router.post('/insert', userController.insert);

module.exports = router;
