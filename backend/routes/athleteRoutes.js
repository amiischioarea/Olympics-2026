const express = require('express');
const router = express.Router();
const Joi = require('joi');

// scheme validare
const athleteSchema = Joi.object({
    first_name: Joi.string().min(2).max(30).required(),
    last_name: Joi.string().min(2).max(30).required(),
    country_id: Joi.number().integer().positive().required(),
    sport_id: Joi.number().integer().positive().required()
});

const searchSchema = Joi.object({
    name: Joi.string().min(1).max(50).required()
});

// exportam o functie care primeste baza de date 
module.exports = (db) => {

    router.get('/search', (req, res) => {
        const { error, value } = searchSchema.validate(req.query);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const searchTerm = `%${value.name}%`;
        const sql = `
            SELECT a.athlete_id, a.first_name, a.last_name, c.name AS country, s.name AS sport 
            FROM Athletes a
            JOIN Countries c ON a.country_id = c.country_id
            JOIN Sports s ON a.sport_id = s.sport_id
            WHERE a.first_name LIKE ? OR a.last_name LIKE ?`;

        db.all(sql, [searchTerm, searchTerm], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    router.get('/', (req, res) => {
    const sql = `SELECT * FROM Athletes ORDER BY last_name ASC`; 
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Eroare SQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Date trimise către frontend:", rows.length, "rânduri");
        res.json(rows);
    });
});

    router.post('/', (req, res) => {
        const { error, value } = athleteSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { first_name, last_name, country_id, sport_id } = value;
        const sql = `INSERT INTO Athletes (first_name, last_name, country_id, sport_id) VALUES (?, ?, ?, ?)`;
        
        db.run(sql, [first_name, last_name, country_id, sport_id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: "athlete created" });
        });
    });

    router.put('/:id', (req, res) => {
        const { first_name, last_name } = req.body;
        const sql = `UPDATE Athletes SET first_name = ?, last_name = ? WHERE athlete_id = ?`;
        
        db.run(sql, [first_name, last_name, req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: "athlete not found" });
            res.json({ message: "athlete updated" });
        });
    });

    router.delete('/:id', (req, res) => {
        const sql = `DELETE FROM Athletes WHERE athlete_id = ?`;
        db.run(sql, req.params.id, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "athlete deleted" });
        });
    });

    return router;
};