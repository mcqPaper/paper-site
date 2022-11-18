const express = require('express');
const http = require('http');
const path = require('path');;
const app = express();
const port = process.env.port || 8085;
const compression = require('compression')
const options = {};
app.use(compression());
app.use(express.static(__dirname + '/build/'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/build/index.html'));
    console.log(`start listening on port: ${port}`)
});


http.createServer(options, app).listen(port);
console.log(`start listening on port: ${port}`)