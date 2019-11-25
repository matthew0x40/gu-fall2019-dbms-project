'use strict';

const bcrypt = require('bcryptjs');
const db = require('./database.js');

const self = {
    
    /**
     * callback(err, results)
     */
    createUser: function(name, email, plainTextPass, website_url, callback) {
        self.hashPassword(plainTextPass, function(err, hash) {
            if (err)
                return callback(err);
            
            const payload = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: hash,
                website_url: website_url || null,
            };
            
            db.query('INSERT INTO user_table SET ?', payload, function (err, results, fields) {
                if (err)
                    return callback(err);
                
                callback(undefined, results);
            });
        });
    },
    
    /**
     * callback(err, results)
     */
    changeUserPassword: function(userId, plainTextPass, callback) {
        self.hashPassword(plainTextPass, function(err, hash) {
            if (err)
                return callback(err);
            
            db.query('UPDATE user_table SET password = ? WHERE user_id = ?', [hash, userId], function (err, results, fields) {
                if (err)
                    return callback(err);
                
                callback(undefined, results);
            });
        });
    },
    
    /**
     * callback(err, hash)
     */
    hashPassword: function(plainTextPass, callback) {
        bcrypt.genSalt(10, function(err, salt) {
            if (!err)
                bcrypt.hash(plainTextPass, salt, callback);
            else
                callback(err);
        });
    },
    
    /**
     * callback(err, result): result is falsey if password-check fails, otherwise user object (database entry) if successful
     */
    checkPassword: function(email, plainTextPass, callback) {
        email = email.trim().toLowerCase();
        
        db.query('SELECT * FROM user_table WHERE email = ?', [email], function (err, results, fields) {
            if (err)
                return callback(err, undefined);
            if (!results || !results[0] || !results[0].password)
                return callback('user not found', undefined);
            
            const user = results[0];
            bcrypt.compare(plainTextPass, user.password, function(err, res) {
                if (res === true) {
                    callback(undefined, user);
                } else {
                    callback(undefined, false);
                }
            });
        });
    }
};

module.exports = self;