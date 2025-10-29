const express = require('express');
require('dotenv').config({ quiet: true });
const authController = require('./conrollers/authController');
const userController = require('./conrollers/userController');
const accountController = require('./conrollers/accountController');

const app = express();
app.use(express.json());
app.use('/login', authController);
app.use('/users', userController);
app.use('/account', accountController);

module.exports = app;
