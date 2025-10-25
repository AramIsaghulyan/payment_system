const express = require('express');
require('dotenv').config({ quiet: true });
const authController = require('./conrollers/authController');
const userController = require('./conrollers/userController');

const app = express();
app.use(express.json());
app.use('/login', authController);
app.use('/users', userController);

module.exports = app;
