const express = require('express');
const router = express.Router();
const Joi = require('joi');

const medalSchema = Joi.object({
    medal_type: Joi.string().valid('Gold', 'Silver', 'Bronze').required(),
    athlete_id: Joi.number().integer().positive().required(),
    event_id: Joi.number().integer().positive().required()
});


module.exports = (db) => {
    // GET all medals
    router.get('/', (req, res) => {
        const sql = `
            SELECT m.medal_id, m.medal_type, a.first_name, a.last_name, s.name as sport
            FROM Medals m
            JOIN Athletes a ON m.athlete_id = a.athlete_id
            JOIN Sports s ON a.sport_id = s.sport_id
            ORDER BY m.medal_id DESC`; 
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // POST award medal
    router.post('/', (req, res) => {
        const { error, value } = medalSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { medal_type, athlete_id, event_id } = value;
        const sql = `INSERT INTO Medals (medal_type, athlete_id, event_id) VALUES (?, ?, ?)`;
        db.run(sql, [medal_type, athlete_id, event_id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Medal awarded" });
        });
    });

    return router;
};