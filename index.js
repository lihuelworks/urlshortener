require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validUrl = require('valid-url');
const shortid = require('shortid');
const sqlite3 = require('sqlite3').verbose();
const dns = require('dns');

const db = new sqlite3.Database('./urlDatabase.db');

db.run('CREATE TABLE IF NOT EXISTS urls (shortid TEXT, original TEXT UNIQUE)');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;

  if (!validUrl.isUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  const urlObj = new URL(url);
  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    db.get('SELECT * FROM urls WHERE original = ?', [url], (err, row) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      if (row) {
        res.json({ original_url: url, short_url: `${row.shortid}` });
      } else {
        const newShortId = shortid.generate();
        db.run('INSERT INTO urls (shortid, original) VALUES (?, ?)', [newShortId, url], function (err) {
          if (err) {
            return res.json({ error: 'invalid url' });
          }
          res.json({ original_url: url, short_url: `${newShortId}` });
        });
      }
    });
  });
});

app.get('/api/shorturl/:shortid', function (req, res) {
  const { shortid } = req.params;

  db.get('SELECT * FROM urls WHERE shortid = ?', [shortid], (err, row) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    if (row) {
      return res.redirect(row.original);
    } else {
      return res.json({ error: 'invalid url' });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
