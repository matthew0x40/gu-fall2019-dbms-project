'use strict';

const router = require('express').Router();
const db = require('@/src/database.js');

router.post('/forms/leavereview', async (req, res) => {
    let showId = req.body.showId;
    let score = req.body.score;
    let reviewText = req.body.reviewText;

    if (!req.session.loggedIn || typeof req.session.userId !== 'number') {
        req.session.leaveReviewError = 'Must be logged in to leave a review.';
        res.redirect(req.body.cont || '/');
        return;
    }

    if (!showId || !score || !reviewText) {
        return;
    }

    try {

    } catch(e) {
        // This should never happen
        req.session.leaveReviewError = '.';
        res.redirect(req.body.cont || '/');
        return;
    }

    try {
        showId = parseInt(showId);
    } catch (e) {
        // This should never happen
        req.session.leaveReviewError = 'Failed to add your review, try again later.';
        res.redirect(req.body.cont || '/');
        return;
    }

    if (score > 5 || score < 0) {
        // This should never happen
        req.session.leaveReviewError = 'Invalid score.';
        res.redirect(req.body.cont || '/');
        return;
    }

    try {
        const result = await db.query(
            'INSERT INTO review (show_id, review_text, score, review_date, reviewer_id) VALUES (?,?,?,NOW(),?)',
            [showId, reviewText, score, req.session.userId]
        );

        res.redirect((req.body.cont || '/') + '#review-' + result.insertId);
    } catch (e) {
        console.log(e);
        req.session.leaveReviewError = 'Failed to add your review, try again later.';
        res.redirect(req.body.cont || '/');
    }
});

router.get('/forms/getCastMembers', async (req, res) => {
    let firstName = req.query.firstName || '';
    let lastName = req.query.lastName || '';

    let searchResults = [];

    if (firstName.length && lastName.length) {
        searchResults = await db.query('SELECT * FROM cast_member WHERE INSTR(first_name, ?) > 0 AND INSTR(last_name, ?) > 0', [ firstName, lastName ]);
    } else if (firstName.length) {
        searchResults = await db.query('SELECT * FROM cast_member WHERE INSTR(first_name, ?) > 0', [ firstName ]);
    } else if (lastName.length) {
        searchResults = await db.query('SELECT * FROM cast_member WHERE INSTR(last_name, ?) > 0', [ lastName ]);
    }

    res.json(searchResults);
});

router.post('/forms/addNewMovie', async (req, res) => {
    let showType = req.body.showType;
    let showRating = req.body.showRating;
    let showName = req.body.showName;
    let showRelease = req.body.showRelease;
    let showLength = parseInt(req.body.showLength);

    
    if (!req.session.loggedIn || typeof req.session.userId !== 'number') {
        req.session.leaveReviewError = 'Must be logged in to leave a movie.';
        res.redirect(req.body.cont || '/');
        return;
    }
    
    if (!req.session.userType === 'admin') {
        req.session.leaveReviewError = 'Must be admin.';
        res.redirect(req.body.cont || '/');
        return;
    }

    try {
        const result = await db.query(
            'INSERT INTO shows (show_type, rating, name, release_date, length_minutes) VALUES (?,?,?,?,?)',
            [showType, showRating, showName, showRelease, showLength]
        );
        res.redirect(req.body.cont || '/');
    } catch (e) {
        console.log(e);
        req.session.leaveReviewError = 'Failed to add your movie, try again later.';
        res.redirect(req.body.cont || '/');
    }
});

module.exports = router;