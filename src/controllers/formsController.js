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

router.post('/forms/delete-show', async (req, res) => {
    const showId = parseInt(req.body.showId);

    try {
        await db.query('DELETE FROM review WHERE show_id = ?', [ showId ]);
        await db.query('DELETE FROM shows WHERE show_id = ?', [ showId ]);
        res.redirect(req.body.cont || '/');
    } catch (err) {
        // uh oh
    }
});

router.post('/forms/delete-review', async (req, res) => {
    const reviewId = parseInt(req.body.reviewId);
    const reviewData = (await db.query('SELECT * FROM review WHERE review_id = ?', [ reviewId ]))[0];

    if (req.session.loggedIn &&
            (reviewData.reviewer_id === req.session.userId || req.session.userType === 'admin')) {
        try {
            await db.query('DELETE FROM review WHERE review_id = ?', [ reviewId ]);
            res.redirect(req.body.cont || '/');
        } catch (err) {
            // uh oh
        }
    } else {
        res.render('pages/404');
        return;
    }
});

router.post('/forms/edit-show', async (req, res) => {
    if (!req.session.loggedIn || !req.session.userType === 'admin') {
        res.render('pages/404');
        return;
    }

    // If showId is empty then we're creating a new show otherwise we're editing the show with
    // the id of showId
    let showId = parseInt(req.body.showId);

    let showType = req.body.showType;
    let showRating = req.body.showRating;
    let showName = req.body.showName;
    let showRelease = req.body.showRelease;
    let showLength = parseInt(req.body.showLength);

    if (!req.session.loggedIn || typeof req.session.userId !== 'number') {
        res.render('pages/404');
        return;
    }

    if (!req.session.userType === 'admin') {
        res.render('pages/404');
        return;
    }

    try {
        if (showId) {
            await db.query(
                `UPDATE shows SET show_type = ?, rating = ?, name = ?, release_date = ?, length_minutes = ?
                WHERE show_id = ?`,
                [showType, showRating, showName, showRelease, showLength, showId]
            );
            res.redirect('/' + showType + '/' + showId);
        } else {
            const result = await db.query(
                'INSERT INTO shows (show_type, rating, name, release_date, length_minutes) VALUES (?,?,?,?,?)',
                [showType, showRating, showName, showRelease, showLength]
            );
            // Redirect to the show page
            res.redirect('/' + showType + '/' + result.insertId);
        }

    } catch (e) {
        console.log(e);
        req.session.leaveReviewError = 'Failed to add your movie, try again later.';
        res.redirect(req.body.cont || '/');
    }
});

module.exports = router;