/**
 * Description:
 * Creates req.superagent from fs-superagent.
 * Adds some additional defaults:
 *
 *  - Metric logging
 *  - Request closing on client close
 * Creates a req.superagent() function which add some nice defaults and log metrics to a superagent call.
 *
 * Example
 *
 *     app.get('/', function(req, res) {
 *       req.superagent
 *         .get('http://example.com')
 *         .end(function(err, res) {
 *           // The request has the default headers applied
 *           // do app work here
 *         })
 *     });
 */

/*global Buffer:false,clearInterval:false,clearTimeout:false,console:false,exports:false,global:false,module:false,process:false,querystring:false,require:false,setInterval:false,setTimeout:false,__filename:false,__dirname:false */
'use strict';

/**
 * Module deps
 */
var url = require('url')
  , fsSuperagent = require('../fs-superagent');

module.exports = function() {
  return function superagent(req, res, next) {
    var context = fsSuperagent({
      'cookies' : req.cookies,
      'headers' : req.headers
    });
    context.on('request', function(request) {
      var info = url.parse(request.url)
        , addToLogs
        , done = req.metric.profile('response_time', {
          lib: 'fs-superagent',
          protocol: (info.protocol || '').replace(':', ''),
          hostname: info.hostname,
          port: info.port,
          path: info.path
        });

      function closeRequest() {
        request.abort();
      }

      req.on('close', closeRequest);

      request.on('response', function(response) {
        var metricData = {
          code: response.status,
          bytes: response.headers['content-length']
        };
        for (var key in addToLogs) {
          if (addToLogs.hasOwnProperty(key)) {
            metricData[key] = addToLogs[key];
          }
        }
        req.removeListener('close', closeRequest);
        done(metricData);
      });
    });
  };
};
