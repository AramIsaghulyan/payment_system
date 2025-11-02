const express = require('express');
const morgan = require('morgan');
require('dotenv').config({ quiet: true });
const authController = require('./conrollers/authController');
const userController = require('./conrollers/userController');
const accountController = require('./conrollers/accountController');
const paymentController = require('./conrollers/paymentController');

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use('/login', authController);
app.use('/users', userController);
app.use('/account', accountController);
app.use('/payment', paymentController);

module.exports = app;
