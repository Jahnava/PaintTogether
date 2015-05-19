(function(){
  'use strict';

	angular.module('drawTogether.hall', [])
	.controller('HallwayCtrl', ['User','$scope', '$location', '$http', Hallway ]);

	function Hallway(User, $scope, $location, $http) {
		
		if (!User.name) { $location.path('/index'); }
		
		var hall = this;
		var socket = User.socket;
		hall.loadingRooms = true;
		getRooms();
		
	  hall.enterRoom = function(room) {
	  	User.setRoom(room);
	  	$location.path('/room/' + encodeURIComponent(room));
	  }

		hall.createRoom = function(room) {
			room = cleanInput(room);
	  	User.setRoom(room);
			$http.post('/newRoom', {room: room}).success(function(data, status) {
				socket.emit('added room');
				$location.path('/room/' + encodeURIComponent(room));
		  })
		  .error(function(data, status) {
		    console.log("Could not post room", status);
		  });
		}

		function cleanInput (input) {
		  return $('<div/>').text(input).text();
		}

		function getRooms() {
			$http.get('/hallway').success(function(data, status) {
		    hall.rooms = data;
		    hall.loadingRooms = false;
		  })
		  .error(function(data, status) {
		    console.log("Could not get rooms");
		  });
		}

		socket.on('rooms changed', function() {
			getRooms();
		});
	}
})();	