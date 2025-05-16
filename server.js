const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes can be added here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});