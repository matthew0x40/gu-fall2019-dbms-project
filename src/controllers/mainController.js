'use strict';

const router = require('express').Router();
const db = require('@/src/database.js');
const search = require('@/src/advancedSearch.js');

router.get('/', async (req, res) => {
    const sortOption = req.query.sort || 'recent release';

    res.render('pages/index', {
        shows: await search.search({ sort: sortOption }),
        sortOption: sortOption,
    });
});

router.get('/search', async (req, res) => {
    res.render('pages/searchResults', {
        shows: await search.search(await search.parseQueryParams(req.query)),
        optionChoices: (await search.getFilterOptionChoices()).available,
        defaultValues: await search.getDefaultFieldValues(req.query),
    });
});

router.get('/addmovie', async (req, res) => {
    res.render('pages/addMovie', {});
});


router.get('/:type(movie|tv-show)/:showId', async (req, res) => {
	const showId = req.params.showId;

    const show = await db.query(
        `SELECT s.show_id, s.show_type, s.rating, s.name, s.release_date,
                s.length_minutes, COALESCE(AVG(r.score),0) as score
        FROM shows s LEFT JOIN review r USING (show_id) GROUP BY show_id
        WHERE show_id = ?`, [ showId ]);

    if (!show.length) {
        res.render('pages/404');
        return;
    }

    const orderByComponent = ({
        recent: 'review_date DESC',
        highestScore: ' score DESC',
        lowestScore: 'score ASC',
    })[req.params.sortReviews || 'recent'];

    const castMembers = await db.query(`SELECT * FROM show_cast_member
        JOIN cast_member USING (cast_member_id) WHERE show_id = ?`, [ showId ]);

    const userReviews = await db.query(
        `SELECT * FROM review r JOIN user_table u ON (r.reviewer_id = u.user_id)
        WHERE show_id = ? HAVING user_type = 'normal' OR user_type = 'admin'
        ORDER BY ${orderByComponent}`, [ showId ]);
    const criticReviews = await db.query(
        `SELECT * FROM review r JOIN user_table u ON (r.reviewer_id = u.user_id)
        WHERE show_id = ? HAVING user_type = 'critic'
        ORDER BY ${orderByComponent}`, [ showId ]);

    let reviewErrorMessage = null;

    if (req.session.leaveReviewError) {
        reviewErrorMessage = req.session.leaveReviewError;
        delete req.session.leaveReviewError;
    }

    res.render('pages/show', {
        show: show && show[0],
        castMembers: castMembers,
        criticReviews: criticReviews,
        userReviews: userReviews,
        reviewErrorMessage: reviewErrorMessage,
    });
});

module.exports = router;