var fs = require('fs');
var express = require('express');

var config = JSON.parse(fs.readFileSync('./config.json'));

var app = express();
var serveStatic = require('serve-static');

app.use(serveStatic('./public'));

app.listen(config.port, function () {
    console.log('Kaiwa Server launched… ');
});
