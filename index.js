'use strict';

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();
const db = require('./src/database.js');

app.set('view engine', 'ejs');

router.get('/', (req, res) => {
    db.query('SELECT * FROM shows', function (error, results, fields) {
        res.render('pages/index', {
            shows: results
        });
    });    
});

router.get('/movie/:showId', (req, res) => {
	const showId = req.params.showId;
	
    db.query('SELECT * FROM shows WHERE show_id = :showId', { showId }, function (error, results, fields) {
        res.render('pages/show', {
            show: results[0]
        });
    });    
});

app.use('/', router);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));