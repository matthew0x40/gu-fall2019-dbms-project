'use strict';

const db = require('@/src/database.js');

class AdvancedSearch {
    static async getFilterOptionChoices() {
        return {
            available: {
                type: ['movie', 'tv-show'],
                rating: ['G','PG','PG-13','R','NR','NC-17'],
                genres: (await db.query('SELECT genre_name FROM genre')).map(o => o.genre_name),
                stars: [5,4,3,2,1],
                sort: ['highest score', 'lowest score', 'recent release']
            },
            default: {
                type: 'all',
                rating: 'all',
                genres: 'all',
                stars: 'all',
                sort: 'highest score',
            }
        };
    }
    static async getDefaultFieldValues(queryParams) {
        const filterOptionChoices = await AdvancedSearch.getFilterOptionChoices();

        function handleFilterOption(prop) {
            let value = queryParams[prop];

            if (typeof queryParams[prop] !== 'object') {
                try {
                    value = JSON.parse(queryParams[prop]);
                } catch (e) {
                    value = {}; // if invalid JSON
                }
            }

            if (Object.keys(value).length == 0) {
                value[filterOptionChoices.default[prop]] = 'add';
            } else {
                delete value.all; // if 'all' property exists
            }
            return value;
        }

        return {
            title: (queryParams.title || '').trim(),
            type: handleFilterOption('type'),
            rating: handleFilterOption('rating'),
            genres: handleFilterOption('genres'),
            stars: handleFilterOption('stars'),
            minReleaseDate: (queryParams.minReleaseDate || '').trim(),
            maxReleaseDate: (queryParams.maxReleaseDate || '').trim(),
            hours: isNaN(parseInt(queryParams.hours)) ? '' : parseInt(queryParams.hours),
            minutes: isNaN(parseInt(queryParams.minutes)) ? '' : parseInt(queryParams.minutes),
            castMember:
                (!Array.isArray(queryParams.castMember) || !queryParams.castMember.length) ? []
                : await db.query('SELECT * FROM cast_member WHERE cast_member_id IN (?)',
                    [ queryParams.castMember.map(x => parseInt(x)) ]),
            sort: handleFilterOption('sort'),
        };
    }
    static async search(searchTerms) {
        return await db.query(
            `SELECT s.show_id, s.show_type, s.rating, s.name, s.release_date,
                s.length_minutes, COALESCE(AVG(r.score),0) as score
            FROM shows s LEFT JOIN review r USING (show_id) GROUP BY show_id
            ORDER BY release_date DESC`);
    }
    static async parseQueryParams(queryParams) {
        const filterOptionChoices = await AdvancedSearch.getFilterOptionChoices();

        let hours = isNaN(parseInt(queryParams.hours)) ? 0 : parseInt(queryParams.hours);
        let minutes = isNaN(parseInt(queryParams.minutes)) ? 0 : parseInt(queryParams.minutes);

        function parseDate(dateStr) {
            try {
                return (new Date(dateStr)).toISOString().slice(0,10);
            } catch (e) {
                return null;
            }
        }

        function handleFilterOption(value) {
            try {
                let obj = JSON.parse(value);
                return {
                    add: Object.keys(obj).filter(k => k != 'all' && obj[k] == 'add'),
                    remove: Object.keys(obj).filter(k => obj[k] == 'remove'),
                };
            } catch (e) {
                return null; // if invalid JSON
            }
        }

        try {
            queryParams.sort = JSON.parse(queryParams.sort);
        } catch (e) {
            queryParams.sort = {};
        }

        return {
            title: (queryParams.title || '').trim() || null,
            type: handleFilterOption(queryParams.type),
            rating: handleFilterOption(queryParams.rating),
            genres: handleFilterOption(queryParams.genres),
            stars: handleFilterOption(queryParams.stars),
            minReleaseDate: parseDate(queryParams.minReleaseDate),
            maxReleaseDate: parseDate(queryParams.maxReleaseDate),
            length_minutes: (hours * 60 + minutes) || null,
            castMember: Array.isArray(queryParams.castMember) && queryParams.castMember.length ?
                queryParams.castMember.map(x => parseInt(x)) : null,
            // sort is a radio input, so there should only be one value -- the first (and only) key
            sort: Object.keys(queryParams.sort)[0] || filterOptionChoices.default.sort,
        }
    }
}

module.exports = AdvancedSearch;