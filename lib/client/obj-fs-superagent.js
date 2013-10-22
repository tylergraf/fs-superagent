/*global console:false,module:false,require:false,document:false,window:false,XMLHttpRequest:false */
'use strict';

var fsSuperagent = require('../fs-superagent')
  , readCookies = require('./helpers/readCookies');

if (typeof window.FS === "object") {
  window.FS.superagent = fsSuperagent({
      cookies: readCookies()
    });
}
