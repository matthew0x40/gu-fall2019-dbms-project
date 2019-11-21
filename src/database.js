'use strict';

const mysql = require('mysql');

const db = mysql.createPool(process.env.CLEARDB_DATABASE_URL);

module.exports = db;