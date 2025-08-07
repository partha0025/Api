const express = require('express');
const cors = require('cors');
const db = require('./db');           // MySQL DB connection
const sendAlert = require('./email'); // Alert function (e.g., email/SMS)
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure table exists
db.query(`
  CREATE TABLE IF NOT EXISTS voltages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    generationVoltage FLOAT,
    batteryVoltage FLOAT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err);
  } else {
    console.log('✅ voltages table ensured');
  }
});

// POST: Receive data from ESP32
app.post('/api/voltages', (req, res) => {
  const { generationVoltage, batteryVoltage } = req.body;

  if (generationVoltage == null || batteryVoltage == null) {
    return res.status(400).json({ message: 'generationVoltage and batteryVoltage are required' });
  }

  const sql = 'INSERT INTO voltages (generationVoltage, batteryVoltage) VALUES (?, ?)';
  db.query(sql, [generationVoltage, batteryVoltage], (err) => {
    if (err) {
      console.error('❌ DB insert error:', err);
      return res.sendStatus(500);
    }

    console.log(`📥 Data saved: G=${generationVoltage}, B=${batteryVoltage}`);

    // Trigger alert if battery voltage is low
    if (batteryVoltage < 11.0) {
      sendAlert(batteryVoltage);
    }

    res.status(200).json({ message: 'Data stored successfully' });
  });
});

// GET: Latest voltage data
app.get('/api/voltages', (req, res) => {
  const sql = 'SELECT * FROM voltages ORDER BY timestamp DESC LIMIT 1';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Fetch error:', err);
      return res.sendStatus(500);
    }

    if (results.length === 0) {
      return res.json({ generationVoltage: 0, batteryVoltage: 0 });
    }

    res.json(results[0]);
  });
});

// GET: Voltage history (last 50 records)
app.get('/api/voltages/history', (req, res) => {
  const sql = 'SELECT * FROM voltages ORDER BY timestamp DESC LIMIT 50';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Fetch error:', err);
      return res.sendStatus(500);
    }

    res.json(results.reverse()); // Return from oldest to newest
  });
});

app.post('/api/voltages', (req, res) => {
  const { generationVoltage, batteryVoltage } = req.body;

  // Check for missing or invalid data
  if (typeof generationVoltage !== 'number' || typeof batteryVoltage !== 'number') {
    return res.status(400).json({
      message: 'generationVoltage and batteryVoltage must be numbers'
    });
  }

  const sql = 'INSERT INTO voltages (generationVoltage, batteryVoltage) VALUES (?, ?)';
  db.query(sql, [generationVoltage, batteryVoltage], (err) => {
    if (err) {
      console.error('❌ DB insert error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log(`📥 Data saved: G=${generationVoltage}, B=${batteryVoltage}`);

    // Trigger alert if battery voltage is too low
    if (batteryVoltage < 11.0) {
      sendAlert(batteryVoltage);
    }

    res.status(200).json({ message: 'Data stored successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
