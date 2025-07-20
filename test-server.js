const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('GET request received');
  res.json({ status: 'Test server working!' });
});

const port = 3001;
app.listen(port, '127.0.0.1', () => {
  console.log(`Test server running on http://127.0.0.1:${port}`);
});