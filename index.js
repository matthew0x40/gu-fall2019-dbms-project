'use strict';

require('module-alias/register');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const express = require('express');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.use(require('@/src/middleware/sessionsMiddleware.js'));
app.use('/', require('@/src/controllers/mainController.js'));
app.use('/', require('@/src/controllers/authController.js'));

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));