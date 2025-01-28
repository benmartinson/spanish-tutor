const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create SQLite database connection
const db = new sqlite3.Database('warehouse.db');

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS warehouse_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    location TEXT,
    category TEXT
  )
`);

// Get all items
app.get('/api/items', (req, res) => {
  console.log('Received GET request for items');
  db.all('SELECT * FROM warehouse_items', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Retrieved items:', rows);
    res.json(rows);
  });
});

// Add new item
app.post('/api/items', (req, res) => {
  console.log('Received POST request:', req.body);
  const { name, quantity, location, category } = req.body;
  db.run(
    'INSERT INTO warehouse_items (name, quantity, location, category) VALUES (?, ?, ?, ?)',
    [name, quantity, location, category],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM warehouse_items WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM warehouse_items WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Item deleted' });
  });
});

// Add proxy endpoint for DeepSeek API
app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', req.body, {
      headers: {
        'Authorization': `Bearer sk-da7d63da87954d4689393ce4622900f5`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch from DeepSeek API',
      details: error.response?.data || error.message 
    });
  }
});

const port = 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
