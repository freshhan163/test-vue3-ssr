const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', function(req, res) {
    const html = fs.readFileSync('./index.html', 'utf-8');
    res.send(html);
});

app.listen(3003, function() {
    console.log('http://localhost:3003');
});
