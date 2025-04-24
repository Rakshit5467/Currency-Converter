const express = require('express');
const compression = require('compression');
const app = express();
app.use(compression()); // Enable Gzip
app.use(express.static('.')); // Serve files
app.listen(5500, () => console.log('Running on http://127.0.0.1:5500'));