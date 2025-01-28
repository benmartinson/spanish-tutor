const express = require('express');
const pool = require('./db');

const app = express();

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
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
}); 