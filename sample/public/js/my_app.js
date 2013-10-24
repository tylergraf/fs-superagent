(function(ng, fsSuperagent) {
  "use strict";

  var module = ng.module('ngSuperagent', []);

  fsSuperagent(module);

  module.controller('fsSuperagentController', [
    "$scope",

    function($scope) {
      $scope.fireWithFS = function() {
        FS.superagent
          .get('/sample/fs')
          .set({'something': 'nothing'})
          .set({'accept': 'application/json,text/html'})
          .end(function(err, response) {
            if (err) return console.error('err', err);
            alert(response.text);
          });
      };
    }
  ]);

  module.controller('ngSuperagentController', [
    "$scope",
    "$superagent",
    "myService",

    function($scope, $superagent, service) {
      $scope.text = 'ready';
      $scope.fireWithInit = function() {
        service.makeCall(function(response) {
          $scope.text = response.text;
        });
      };
      $scope.fireWithoutInit = function() {
        $superagent
          .get('/sample/setScope')
          .$setScope($scope)
          .end(function(err, response) {
            if (err) return console.error('err', err);
            $scope.text = response.text;
          });
      };
    }
  ]);

  module.factory('myService', [
    '$superagent',

    function($superagent) {
      function makeCall(next) {
        $superagent
          .get('/sample/directive')
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


})(window.angular, window.fsSuperagent);
