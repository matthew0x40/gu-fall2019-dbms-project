'use strict';

const mysql = require('mysql');

if (!process.env.CLEARDB_DATABASE_URL) {
    console.error('CLEARDB_DATABASE_URL env variable is required. Should be of the format "mysql://{USER}:{PASSWORD}@{HOST}/{DB}"');
    process.exit(1);
}

const db = mysql.createPool(process.env.CLEARDB_DATABASE_URL);

module.exports = db;

