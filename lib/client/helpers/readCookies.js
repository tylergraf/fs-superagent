/*global console:false,module:false,require:false,document:false,window:false,XMLHttpRequest:false */
'use strict';

var cookies;

module.exports = function readCookies() {
  if (cookies) return cookies;
  var c, C, i;

  c = document.cookie.split('; ');
  cookies = {};

  for(i=c.length-1; i>=0; i--){
    C = c[i].split('=');
    cookies[C[0]] = C[1];
  }

  return cookies;
};
