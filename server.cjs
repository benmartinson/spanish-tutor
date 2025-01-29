const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create SQLite database connection
const db = new sqlite3.Database('chat.db');

app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    // Validate request body
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array is required' });
    }

    if (!req.body.model) {
      req.body.model = 'deepseek-chat'; // Set default model if not provided
    }
    
    // Call DeepSeek API
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', req.body, {
      headers: {
        'Authorization': `Bearer sk-da7d63da87954d4689393ce4622900f5`,
        'Content-Type': 'application/json'
      }
    });

    // Get the bot's response text
    const botResponse = response.data.choices[0].message.content;

    // Get the user's last message from the request
    const userMessage = req.body.messages[req.body.messages.length - 1].content;

    // Save user message to database
    db.run(
      'INSERT INTO chat_messages (text, is_bot) VALUES (?, ?)',
      [userMessage, false],
      function(err) {
        if (err) {
          console.error('Error saving user message:', err);
        }
      }
    );

    // Save bot response to database
    db.run(
      'INSERT INTO chat_messages (text, is_bot) VALUES (?, ?)',
      [botResponse, true],
      function(err) {
        if (err) {
          console.error('Error saving bot response:', err);
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch from DeepSeek API',
      details: error.response?.data || error.message 
    });
  }
});

// Create messages table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    is_bot BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all messages
app.get('/api/messages', (req, res) => {
  db.all('SELECT text, is_bot as isBot FROM chat_messages ORDER BY created_at ASC', (err, rows) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new message
app.post('/api/messages', (req, res) => {
  const { text, isBot } = req.body;
  db.run(
    'INSERT INTO chat_messages (text, is_bot) VALUES (?, ?)',
    [text, isBot],
    function(err) {
      if (err) {
        console.error('Error adding message:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM chat_messages WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

const port = 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
