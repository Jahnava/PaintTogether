angular.module('drawTogether.room', [])
.controller('RoomCtrl', ['User','$scope', '$location', '$http', function(User, $scope, $location, $http) {

	_this = this;
	var socket = User.socket;

	if (!User.name) {$location.path('/index')
	} else { $http.get('/room/' + User.room).success(function(data, status) {
			this.users = data.users;
			// this.canvas = data.canvas;
	  })
	  .error(function(data, status) {
	    console.log("Could not get room info", status);
	  });
	}

	$scope.$on('$destroy', function() {
		socket.emit('exited room');
	});


	socket.emit('entered room', User.room)

	this.setColor = function(color) {
		User.setColor(color);
	}

	var canvas = new fabric.Canvas('c', {
		backgroundColor: 'dimgray',
		isDrawingMode: true
	});

	if (canvas.freeDrawingBrush) {
	  canvas.freeDrawingBrush.color = User.color;
	  canvas.freeDrawingBrush.width = 5
	}

}]);

