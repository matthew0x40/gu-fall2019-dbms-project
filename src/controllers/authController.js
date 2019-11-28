'use strict';

const router = require('express').Router();
const db = require('@/src/database.js');
const auth = require('@/src/auth.js');

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

module.exports = router;