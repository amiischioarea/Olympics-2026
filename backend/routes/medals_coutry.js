const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// conectarea la baza de date
const db = new sqlite3.Database(path.join(__dirname, '../olympics.db'));

router.get('/medals_country', (req, res) => {
    const sql = `
        SELECT 
            c.name AS country,
            COUNT(CASE WHEN m.medal_type = 'Gold' THEN 1 END) AS gold,
            COUNT(CASE WHEN m.medal_type = 'Silver' THEN 1 END) AS silver,
            COUNT(CASE WHEN m.medal_type = 'Bronze' THEN 1 END) AS bronze,
            COUNT(m.medal_id) AS total
        FROM Countries c
        LEFT JOIN Athletes a ON c.country_id = a.country_id
        LEFT JOIN Medals m ON a.athlete_id = m.athlete_id
        GROUP BY c.country_id
        HAVING total > 0
        ORDER BY gold DESC, silver DESC, bronze DESC;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// FOARTE IMPORTANT: Exportăm router-ul ca să poată fi importat în server.js
module.exports = router;