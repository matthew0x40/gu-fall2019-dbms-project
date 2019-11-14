const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();

const mysql = require('mysql');

const db = mysql.createPool({
  connectionLimit : 10,
  host     : 'us-cdbr-iron-east-05.cleardb.net',
  user     : 'b571a2cf11720b',
  password : 'fd80f87f',
  database : 'heroku_0dda02611b0f97b'
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    db.query('SELECT * FROM shows', function (error, results, fields) {
        res.render('pages/index', {
            testdata: JSON.stringify(results)
        });
    });    
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));