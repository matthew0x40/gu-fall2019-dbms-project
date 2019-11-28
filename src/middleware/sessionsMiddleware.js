'use strict';

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('@/src/database.js');
const sessionStore = new MySQLStore({}, db);

module.exports = [
    session({
        secret: 'd366da96-53b3-43a1-a6e5-19f517162790',
        cookie: { maxAge: 86400 },
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
    }),
    function(req, res, next) {
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-XSS-Protection', '1; mode=block');
        res.header('X-Frame-Options', 'SAMEORIGIN');

        res.locals = {
            userId: req.session.userId || undefined,
            userName: req.session.userName || undefined,
            userType: req.session.userType || undefined,
            userEmail: req.session.userEmail || undefined,
        };
        next();
    }
];