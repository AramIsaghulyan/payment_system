const express = require('express');
require('dotenv').config({ quiet: true });
const userController = require('./conrollers/userController'); 

const app = express();

app.use(express.json());
app.use('users', userController);


module.exports = app;