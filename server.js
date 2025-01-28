const express = require('express');
const pool = require('./db');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/items', async (req, res) => {
  console.log('Received POST request:', req.body);
  const { name, quantity, location, category } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO warehouse_items (name, quantity, location, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, quantity, location, category]
    );
    console.log('Item added successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }


app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      req.body,
      {
        headers: {
          'Authorization': `Bearer sk-da7d63da87954d4689393ce4622900f5`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


});

app.listen(3001, () => {
  console.log('Server running on port 3001');
}); 