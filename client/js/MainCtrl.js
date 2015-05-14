angular.module('drawTogether.main', [])
.controller('MainCtrl', ['User','$scope', '$location', function(User, $scope, $location) {

	var socket = User.socket;

	this.colors = ['rgb(21,177,240)','rgb(52,173,101)', 'rgb(228,0,121)', 'rgb(247,159,75)', 'rgb(255,242,9)', 'rgb(113,73,151)', 'rgb(41,41,41)', 'rgb(229,0,28)' ]
	
	this.setUsername = function(name) {
		name = cleanInput(name);
		User.setName(name);
		User.setID();
		$scope.usernameSet = true;
	}

	this.setColor = function(color) {
		User.setColor(color);
		$scope.colorSet = true;
		$location.path('/hallway');
		socket.emit('add user', {name: User.name, color: color, id:User.id});
	}

	function cleanInput (input) {
	  return $('<div/>').text(input).text();
	}
	
}]);

