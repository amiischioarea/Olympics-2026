const sqlite3 = require('sqlite3').verbose(); //sqlite3 creează sau deschide fișierul bazei de date-importa libraria
const db = new sqlite3.Database('./olympics.db'); //conexiunea de pe hard disk


//pt executia comenzilor
db.serialize(() => {
    // 1. CREARE TABELE
    db.run(`CREATE TABLE IF NOT EXISTS Countries (
        country_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        iso_code TEXT UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Sports (
        sport_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Athletes (
    athlete_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    country_id INTEGER,
    sport_id INTEGER,
    UNIQUE(first_name, last_name), -- Această linie previne dublarea
    FOREIGN KEY (country_id) REFERENCES Countries(country_id),
    FOREIGN KEY (sport_id) REFERENCES Sports(sport_id)
)`);

    db.run(`CREATE TABLE IF NOT EXISTS Medals (
        medal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        medal_type TEXT CHECK(medal_type IN ('Gold', 'Silver', 'Bronze')),
        athlete_id INTEGER,
        event_id INTEGER,
        FOREIGN KEY (athlete_id) REFERENCES Athletes(athlete_id),
        FOREIGN KEY (event_id) REFERENCES Events(event_id)
    )`);

    console.log("--- STRUCTURE CREATED ---");

    // 2. POPULARE CU DATE (MILANO CORTINA 2026)
    db.run(`INSERT OR IGNORE INTO Countries (name, iso_code) VALUES 
        ('Norway', 'NOR'), 
        ('Romania', 'ROU'), 
        ('Italy', 'ITA'),
        ('United States', 'USA'),
        ('Austria', 'AUT'),
        ('Brasil', 'BRA')`);

    db.run(`INSERT OR IGNORE INTO Sports (name, category) VALUES 
        ('Bobsleigh', 'Ice'), 
        ('Alpine Skiing', 'Snow'),
        ('Biathlon', 'Snow'),
        ('Luge', 'Ice')`);

    db.run(`INSERT OR IGNORE INTO Athletes (first_name, last_name, country_id, sport_id) VALUES 
        ('Mihai', 'Tentea', 2, 1), 
        ('Valentin', 'Cretu', 2, 4),
        ('Dominik', 'Paris', 3, 2),
        ('Lucas', 'Braathen', 6, 2),
        ('Manuel', 'Feller', 5, 2),
        ('Mikaela', 'Shiffrin', 4, 2),
        ('Johannes', 'Boe', 1, 3), 
        ('Dimitri', 'Shamaev', 2, 3),
        ('Lisa', 'Vittozzi', 3, 3)`);

        //Inseram medalii
    db.run(`INSERT OR IGNORE INTO Medals (medal_type, athlete_id, event_id) VALUES 
        ('Silver', 5, 1), -- Manuel Feller
        ('Gold', 6, 1),   -- Mikaela Shiffrin
        ('Bronze', 3, 1), -- Dominik Paris
        ('Gold', 7, 3),   -- Johannes Boe
        ('Gold', 4, 1)    -- Lucas Braathen
    `);

    console.log("--- Data has been populated ---");
});

db.close();