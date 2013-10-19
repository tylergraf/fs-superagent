/*global console:false,module:false,require:false,document:false,window:false,XMLHttpRequest:false */
'use strict';

var fsSuperagent = require('../fs-superagent')
  , readCookies = require('./helpers/readCookies');
  // , readHeaders = require('./helpers/readHeaders');

module.exports = function() {
  return fsSuperagent({
      // headers: readHeaders(),
      cookies: readCookies()
    });
};
