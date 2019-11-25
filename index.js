'use strict';

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const db = require('./src/database.js');
const auth = require('./src/auth.js');
const sessionStore = new MySQLStore({}, db);

const router = express.Router();
const adminRouter = express.Router();

app.set('view engine', 'ejs');

app.use(session({
    secret: 'd366da96-53b3-43a1-a6e5-19f517162790',
    cookie: { maxAge: 86400 },
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
}));

app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.header('X-XSS-Protection', 1);
    res.locals = { 
        userId: req.session.userId || undefined,
        userName: req.session.userName || undefined,
        userType: req.session.userType || undefined,
        userEmail: req.session.userEmail || undefined,
    };
    next();
});

router.get('/', (req, res) => {
    db.query('SELECT * FROM shows', function (error, results, fields) {
        res.render('pages/index', {
            shows: results,
        });
    });    
});

router.get('/register', (req, res) => {
    res.render('pages/register');
});

router.post('/register', (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        res.render('pages/register', {
            errorMessage: 'must enter your name, email and password'
        });
    } else {
        auth.createUser(req.body.name, req.body.email, req.body.password, req.body.website_url, function(err, results) {
            if (err || !results) {
                res.render('pages/register', {
                    errorMessage: 'registration failed'
                });
            } else {
                res.render('pages/register', {
                    successMessage: 'Success! You can now login.'
                });
            }
        });
    }
});

router.get('/login', function (req, res) {
    res.render('pages/login', {
        cont: req.query.cont || '/'
    });
});

router.post('/login', function (req, res) {
    if (!req.body.email || !req.body.password) {
        res.render('pages/login', {
            cont: req.body.cont || '/',
            errorMessage: 'must enter an email and password'
        });
    } else {
        auth.checkPassword(req.body.email, req.body.password, function(err, userObj) {
            if (err) {
                res.render('pages/login', {
                    cont: req.body.cont || '/',
                    errorMessage: err
                });
            } else {
                if (!userObj) {
                    res.render('pages/login', {
                        cont: req.body.cont || '/',
                        errorMessage: 'password does not match'
                    });
                } else {
                    req.session.regenerate(function(err) {
                        req.session.userId = userObj.user_id;
                        req.session.userType = userObj.user_type;
                        req.session.userName = userObj.name;
                        req.session.userEmail = userObj.email;
                        
                        res.redirect(req.body.cont || '/');
                    });
                }
            }
        });
    }
});

router.get('/logout', function (req, res) {
    req.session.destroy(function(err) {
        res.redirect(req.query.cont || '/');
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