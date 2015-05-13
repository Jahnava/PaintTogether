angular.module('drawTogether.main', [])
.controller('MainCtrl', ['User','$scope', '$location', function(User, $scope, $location) {

	var socket = User.socket;

	this.colors = ['red','green', 'blue'];
	this.rooms = ['myroom', 'weird_room']
	
	this.setUsername = function(name) {
		User.setName(name);
		$scope.usernameSet = true;
	}

	this.setColor = function(color) {
		User.setColor(color);
		$scope.colorSet = true;
		$location.path('/hallway');
		socket.emit('add user', {name: User.name, color: color});
	}


	var canvas = new fabric.Canvas('c', {
		isDrawingMode: true
	});

	if (canvas.freeDrawingBrush) {
	  canvas.freeDrawingBrush.color = 'black'
	  canvas.freeDrawingBrush.width = 5
	}

}]);

