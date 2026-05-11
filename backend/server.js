const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); //arata fiecare accesare in consola

// conexiunea cu baza de date
const db = new sqlite3.Database('./olympics.db', (err) => {
    if (err) {
        console.error(" Eroare la conectarea:", err.message);
    } else {
        console.log(" Conectat cu succes.");
    }
});

db.serialize(() => {
    db.get("SELECT COUNT(*) as nr FROM Athletes", (err, row) => {
        console.log(`[DEBUG] Sportivi: ${row ? row.nr : 0}`);
    });
    db.get("SELECT COUNT(*) as nr FROM Countries", (err, row) => {
        console.log(`[DEBUG] Tari: ${row ? row.nr : 0}`);
    });
    db.get("SELECT COUNT(*) as nr FROM Sports", (err, row) => {
        console.log(`[DEBUG] Sporturi: ${row ? row.nr : 0}`);
    });
});

// se importa rutele
const athleteRoutes = require('./routes/athleteRoutes')(db);
const medalRoutes = require('./routes/medalRoutes')(db);
const medalsRouter = require('./routes/medals_coutry');
const newsRoutes = require('./routes/news');
const news = require('./routes/news');

// definirea rutelor
app.use('/api/athletes', athleteRoutes);
app.use('/api/medals', medalRoutes);
app.use('/api', medalsRouter);
app.use('/api/news', newsRoutes());

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

app.get('/', (req, res) => {
    res.send(' Winter Olympics 2026 API ruleaza');
});

app.listen(port, () => {
    console.log(` server pornit pe: http://localhost:${port}`);
    console.log(` Rute active: /api/athletes, /api/countries, /api/sports`);
});