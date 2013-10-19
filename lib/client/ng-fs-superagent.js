/*global console:false,module:false,require:false,document:false,window:false,XMLHttpRequest:false */
'use strict';

var fsSuperagent = require('../fs-superagent')
  , readCookies = require('./helpers/readCookies');
  // , readHeaders = require('./helpers/readHeaders');

module.exports = function(app) {

  /**
   * Optional $superagent init directive
   */
  app.directive('superagentInit', [
    '$superagent',

    function($superagent) {
      return {
        restrict: 'EA',
        link: function(scope) {
          $superagent.on('request', function(request) {
            request.handleEnd(function(cb, params) {
              scope.$apply(function() {
                cb.apply(null, params);
              });
            });
          });
        }
      };
    }
  ]);

  /**
   * $superagent "Service"
   */
  app.factory('$superagent', [

    function() {
      return fsSuperagent({
          // headers: readHeaders(),
          cookies: readCookies()
        })
        .on('request', function(request) {
          request.$setScope = function(scope) {
            request.handleEnd(function(cb, params) {
              scope.$apply(function() {
                cb.apply(null, params);
              });
            });
            return request;
          };
        });
    }
  ]);
};
