require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validUrl = require('valid-url');
const shortid = require('shortid');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./urlDatabase.db');

// Create table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS urls (shortid TEXT, original TEXT UNIQUE)');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To handle JSON body parsing

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// POST route - check for redundancy and store URL in SQLite
app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;

  // Check if URL is valid
  if (!validUrl.isUri(url)) {
    return res.status(400).json({ error: 'invalid url' });
  }

  // Check if the URL already exists in the database
  db.get('SELECT * FROM urls WHERE original = ?', [url], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      // URL already exists, return the existing short URL
      return res.json({ original_url: url, short_url: `${req.protocol}://${req.get('host')}/api/shorturl/${row.shortid}` });
    } else {
      // URL does not exist, generate a new short ID and store it
      const newShortId = shortid.generate();
      db.run('INSERT INTO urls (shortid, original) VALUES (?, ?)', [newShortId, url], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to store URL' });
        }
        res.json({ original_url: url, short_url: `${req.protocol}://${req.get('host')}/api/shorturl/${newShortId}` });
      });
    }
  });
});

// GET route - retrieve original URL from SQLite and redirect
app.get('/api/shorturl/:shortid', function (req, res) {
  const { shortid } = req.params;

  db.get('SELECT * FROM urls WHERE shortid = ?', [shortid], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      // Redirection to the original URL
      return res.redirect(row.original); 
    } else {
      return res.status(404).json({ error: 'Short URL not found' });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
