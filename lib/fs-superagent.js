/**
 * Create a superagent context from the supplied cookies and headers
 * Applies some defaults like:
 *
 * - response time metrics (Future)
 * - send the x-request-id header
 * - send the authorization if the user is logged in
 *
 * Also provides some additional opt-ins:
 * - Setting locale
 * - Setting sessionId to query
 * - Error handling (Future)
 * - Timeout handling (Future)
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

var superagent = require('superagent-defaults')
  , debug = require('debug')('fsSuperagent')
  , url = require('url');

module.exports = fsSuperagent;

function fsSuperagent(config) {
  var context = superagent()
    , cookies = config.cookies || {}
    , headers = config.headers || {};
  return context.on('request', function(request) {
    var reqId = headers['x-request-id']
      , sessId = cookies.fssessionid
      , info = url.parse(request.url)
      , addToLogs = {}
      , endHandler;

    // TODO: Add metric logging (START)

    request.set('accept', 'application/json');

    // Do we want a default timeout on the client?
    request.timeout(20000);

    if (reqId) request.set('x-request-id', reqId);
    if (sessId) request.set('authorization', 'Bearer ' + sessId);

    request.setLocale = function(locale) {
      locale = (locale || headers['accept-language'] || 'en').substr(0,2);
      request.query({ 'locale' : locale });
      return request;
    };

    request.setSessionId = function(sessionName) {
      request.query(sessionName, sessId);
      return request;
    };

    request.handleErrors = function() {
      request.on('error', function errorHandler(err) {
        // TODO: Add Metric logging (FAILURE)
        if (err.timeout) {
          // TODO: Do something to register a timeout to the server
        }
        // TODO: Do something to register an error with the server
      });
      return request;
    };

    request.addLog = function(name, value) {
      if (typeof name === 'string' && typeof value === 'string') {
        addToLogs[name] = value;
      }
      if (typeof name === 'object') {
        for (var key in name) {
          if (name.hasOwnProperty(key)) {
            addToLogs[key] = name[key];
          }
        }
      }
      return request;
    };

    request.handleEnd = function(handler) {
      if (typeof handler === 'function') {
        endHandler = handler;
      }
    };


    // We have to overwrite the request.end to fix the error handling problems
    request._end = request.end;
    request.end = function(cb) {

      function doCb() {
        if(typeof endHandler === 'function') {
          return endHandler(cb, arguments);
        }
        cb.apply(null, arguments);
      }

      // Default to no error callback
      var okCB = function(response) {
        doCb(response);
      };
      if (cb.length === 2) {
        // 200 callback requires empty first param
        okCB = function(response) {
          doCb(null, response);
        };
        // Bind the error callback for errors
        request
          .on('error', function(err) {
            // handle errors too?
            doCb(err);
          });
      }

      request._end(function(response) {
        // TODO: Add metric logging (FINISHED)
        console.log('addToLogs', addToLogs);
        console.log('contentLength', response.headers['content-length']);
        console.log('status' , response.status);
        okCB(response);
      });
    };
  });
}