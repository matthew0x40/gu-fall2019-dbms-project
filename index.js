'use strict';

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const express = require('express');
const app = express();
const router = express.Router();
const db = require('./src/database.js');

app.set('view engine', 'ejs');

router.use(function(req, res, next) {
    res.header('X-XSS-Protection', 1);
    next();
});

router.get('/', (req, res) => {
    db.query('SELECT * FROM shows', function (error, results, fields) {
        res.render('pages/index', {
            shows: results
        });
    });    
});

router.get('/movie/:showId', (req, res) => {
	const showId = req.params.showId;
	
    db.query('SELECT * FROM shows WHERE show_id = ?', [ showId ], function (error, results, fields) {
        res.render('pages/show', {
            show: results && results[0]
        });
    });    
});

app.use('/', router);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));