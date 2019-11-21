'use strict';

const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();
const db = require('src/database');

app.set('view engine', 'ejs');

router.get('/', (req, res) => {
    db.query('SELECT * FROM shows', function (error, results, fields) {
        res.render('pages/index', {
            testdata: JSON.stringify(results)
        });
    });    
});

app.use(router, '/');
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));