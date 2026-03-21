const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./olympics.db');

// --- GET ROUTES ---
app.get('/api/athletes', (req, res) => {
    const sql = `
        SELECT a.athlete_id, a.first_name, a.last_name, c.name AS country, s.name AS sport 
        FROM Athletes a
        JOIN Countries c ON a.country_id = c.country_id
        JOIN Sports s ON a.sport_id = s.sport_id
        ORDER BY a.athlete_id DESC`; // Adăugat ORDER BY pentru a vedea ultimii adăugați sus
    
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/medals', (req, res) => {
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

app.get('/api/countries', (req, res) => {
    db.all("SELECT * FROM Countries ORDER BY name ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/sports', (req, res) => {
    db.all("SELECT * FROM Sports ORDER BY name ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- POST ROUTES ---
app.post('/api/athletes', (req, res) => {
    const { first_name, last_name, country_id, sport_id } = req.body;
    const sql = `INSERT INTO Athletes (first_name, last_name, country_id, sport_id) VALUES (?, ?, ?, ?)`;
    db.run(sql, [first_name, last_name, country_id, sport_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: "Athlete created successfully!" });
    });
});

app.post('/api/medals', (req, res) => {
    const { medal_type, athlete_id, event_id } = req.body;
    const sql = `INSERT INTO Medals (medal_type, athlete_id, event_id) VALUES (?, ?, ?)`;
    db.run(sql, [medal_type, athlete_id, event_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Medal awarded successfully!" });
    });
});

// --- UPDATE ROUTE ---
app.put('/api/athletes/:id', (req, res) => {
    const { first_name, last_name } = req.body;
    const sql = `UPDATE Athletes SET first_name = ?, last_name = ? WHERE athlete_id = ?`;
    
    db.run(sql, [first_name, last_name, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) {
            return res.status(404).json({ message: "Athlete not found" });
        }
        res.json({ updated: this.changes, message: "Athlete updated successfully!" });
    });
});

// --- DELETE ROUTE ---
app.delete('/api/athletes/:id', (req, res) => {
    const sql = `DELETE FROM Athletes WHERE athlete_id = ?`;
    db.run(sql, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes, message: "Athlete deleted." });
    });
});

app.listen(port, () => {
    console.log(` Server running at http://localhost:${port}`);
    console.log(`Winter Olympics Management System is Ready!`);
});