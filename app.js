/*global Buffer:false,clearInterval:false,clearTimeout:false,console:false,exports:false,global:false,module:false,process:false,querystring:false,require:false,setInterval:false,setTimeout:false,__filename:false,__dirname:false */
'use strict';

var express = require('express');

var app = express();

app.use(express.bodyParser());
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/build'));

app.get('/sample/:type', function(req, res, next) {
  console.log(req.headers);
  res.send('I DID IT I\'M SO AWESOME! (' + req.params.type + ')');
});

app.listen(process.env.PORT || 5000, function() {
  console.log('listening');
});
