'use strict';

const util = require('util');
const mysql = require('mysql');

if (!process.env.CLEARDB_DATABASE_URL) {
    console.error(
        'CLEARDB_DATABASE_URL env variable is required. ' +
        'Should be of the format "mysql://{USER}:{PASSWORD}@{HOST}/{DB}"');
    process.exit(1);
}

const db = mysql.createPool(process.env.CLEARDB_DATABASE_URL);

const realQuery = db.query;
const promiseQuery = util.promisify(db.query);

db.query = function() {
    if (arguments.length > 0 && typeof arguments[arguments.length - 1] === 'function') {
        return realQuery.apply(db, arguments);
    } else {
        return promiseQuery.apply(db, arguments);
    }
};

module.exports = db;