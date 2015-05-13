'use strict';

angular.module('drawTogether', [
  'ngRoute',
  'drawTogether.main',
  'drawTogether.hall',
  'drawTogether.room'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/index', {
      templateUrl: 'client/templates/main.html',
    })
    .when('/hallway', {
      templateUrl: 'client/templates/hallway.html',
      controller: 'HallwayCtrl as hall',
    })
    .when('/room/:id', {
      templateUrl: 'client/templates/room.html',
      controller: 'RoomCtrl as room',
    })
    .otherwise({ redirectTo: '/index' });
}]);