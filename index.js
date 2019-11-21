'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
const router = express.Router();

const db = require('src/database');
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');

router.use(function(req, res, next) {
    res.header('X-XSS-Protection', 1);
    next();
});

router.get('/', (req, res) => {
    db.query('SELECT * FROM shows', function (error, results, fields) {
        res.render('pages/index', {
            testdata: JSON.stringify(results)
        });
    });    
});

app.use('/', router);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));