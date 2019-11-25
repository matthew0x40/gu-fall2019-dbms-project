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

router.get('/search', (req, res) => {
    let searchText = req.query.q;

    db.query('SELECT * FROM shows WHERE INSTR(name, ?) > 0', [ searchText ], function (error, results, fields) {
        res.render('pages/searchResults', {
            shows: results,
            searchText: searchText,
        });
    });    
});

router.get('/leavereview', (req, res) => {
    let showId = req.query.showId;
    let rating = req.query.rating;
    let reviewText = req.query.reviewText;
    let reviewText = req.query.reviewText;

    db.query('INSERT INTO review (show_id, review_text, score, review_date, reviewer_id) VALUES (?,?,?,?,?)' [show_id, reviewText, score, today(), userID], function (error, results, fields) {
        res.render('pages/index', {
            shows: results
        });
    });
});

router.get('/bestscores', (req, res) => {

    db.query('SELECT * FROM review r JOIN shows s USING (show_id) GROUP BY r.show_id SORT BY AVG(r.score) DESC', function (error, results, fields) {
        res.render('pages/bestScoreResults', {
            shows: results,
        });
    });    
});

router.get('/movie/:showId', (req, res) => {
	const showId = req.params.showId;
	
    db.query('SELECT * FROM shows LEFT JOIN review USING (show_id) JOIN show_cast_member USING (show_id) JOIN cast_member USING (cast_member_id) WHERE show_id = ?', [ showId ], function (error, results, fields) {
        res.render('pages/show', {
            show: results,
            showId: showId,
        });
    });    
});

app.use('/', router);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));