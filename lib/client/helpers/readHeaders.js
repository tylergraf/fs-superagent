// I'm not sure this does what I wanted it to do.
// These things are handled elsewhere (HAProxy, accept-language, etc)


/*global console:false,module:false,require:false,document:false,window:false,XMLHttpRequest:false */
'use strict';

var headers;

module.exports = function readHeaders() {
  if (headers) return headers;
  var req;
  req = new XMLHttpRequest();
  req.open('GET', document.location, false);
  req.send(null);
  headers = req.getAllResponseHeaders().toLowerCase();
  return headers;
};
