'use strict';

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();
const db = require('./src/database.js');

app.set('view engine', 'ejs');

document.getElementById('searchBox').addEventListener('change', function () {
    router.get('/', (req, res) => {
        db.query('SELECT name, show_id FROM shows WHERE INSTR(name, ' + document.getElementById('searchBox').value + ') > 0;', function (error, results, fields) {
            res.render('pages/index', {
                shows: results
            });
        });    
    });
})


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