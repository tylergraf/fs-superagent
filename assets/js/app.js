(function(ng, defaults) {
  "use strict";

  var module = ng.module('ngSuperagent', []);

  module.controller('SuperagentController', [
    "$scope",
    "myService",

    function($scope, service) {
      $scope.text = 'ready';
      $scope.doIt = function() {
        service.makeCall(function(text) {
          $scope.text = text;
        });
      };
    }
  ]);

  module.factory('myService', [
    '$superagent',

    function($superagent) {
      function makeCall(next) {
        $superagent
          .get('/sample')
          .end(function(err, response) {
            if (err) return console.error('err', err);
            next(response);
          });
      }
      return {
        makeCall : makeCall
      };
    }
  ]);

  module.directive('ngSuperagent', [
    '$q',
    '$superagent',

    function($q, $superagent) {
      return {
        restrict: 'EACM',
        link: function(scope, elem, attr, ctrl) {
          var configData, headers
            , cookies = readCookies();
          try {
            configData = JSON.parse(attr.ngSuperagent);
          } catch (e) {
            console.error('Expected configData to be JSON');
            return;
          }

          readHeaders().then(function(headers) {
            return $superagent.$configure({
              configData: configData,
              cookies: cookies = cookies,
              headers: headers,
              $scope: scope
            });
          });

          function readCookies() {
            var c, C, i;
            if(cookies) return cookies;

            c = document.cookie.split('; ');
            cookies = {};

            for(i=c.length-1; i>=0; i--){
              C = c[i].split('=');
              cookies[C[0]] = C[1];
            }

            return cookies;
          }

          function readHeaders() {
            var req
              , dfd = $q.defer();
            if (headers) {
              dfd.resolve(headers);
            } else {
              req = new XMLHttpRequest();
              req.open('GET', document.location, false);
              req.send(null);
              headers = req.getAllResponseHeaders().toLowerCase();
              dfd.resolve(headers);
            }
            return dfd.promise;
          }
        }
      };
    }
  ]);

  module.factory('$superagent', [
    function() {
      var context = defaults();

      context.$configure = configure;
      return context;

      function configure(config) {
        var configData = config.configData
          , cookies = config.cookies
          , headers = config.headers
          , $scope = config.$scope;

        context.on('request', function(request) {
          var reqId = headers['x-request-id'] || configData['x-request-id']
            , sessId = cookies.fssessionid || configData.fsSessionId
            , locale = (locale || headers['accept-language'] || configData.locale || 'en').substr(0,2)
            , info = parseUrl(request.url)
            , addToLogs;

          // TODO: Add metric logging (START)

          request.set('accept', 'application/json');

          // Do we want a default timeout on the client?
          // request.timeout(20000);

          if (reqId) request.set('x-request-id', reqId);
          if (sessId) request.set('authorization', 'Bearer ' + sessId);

          request.setLocale = function(locale) {
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

          // We have to overwrite the request.end to do a $digest
          request._end = request.end;
          request.end = function(cb) {
            // Default to no error callback
            var okCB = function() {
              console.error('OK1');
              cb(this.text);
            };
            if (cb.length === 2) {
              // 200 callback requires empty first param
              okCB = function() {
                console.error('OK2');
                cb(null, this.text);
              };
              // Bind the error callback for errors
              request
                .on('error', function(err) {
                  // handle errors too?
                  $scope.$apply(function() {
                    cb(err);
                  });
                });
            }

            request.on('error', function() {
              console.log('error', arguments);
            });
            request._end(function(response) {
              // TODO: Add metric logging (FINISHED)
              console.log('addToLogs', addToLogs);
              console.log('contentLength', response.headers['content-length']);
              console.log('status' , response.status);
              $scope.$apply(okCB.bind(response));
            });
          };
        });
        if (console && console.info) console.info('$superagent configured');
      }

      function parseUrl(href) {
        var parser = document.createElement('a');
        parser.href = href;
        return {
          protocol : parser.protocol, // => "http:"
          hostname : parser.hostname, // => "example.com"
          port : parser.port,         // => "3000"
          pathname : parser.pathname, // => "/pathname/"
          search : parser.search,     // => "?search=test"
          hash : parser.hash,         // => "#hash"
          host : parser.host          // => "example.com:3000"
        };
      }
    }
  ]);


})(window.angular, window["superagent-defaults"]);
