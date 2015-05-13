angular.module('drawTogether.room', [])
.controller('RoomCtrl', ['User','$scope', '$location', '$http', function(User, $scope, $location, $http) {

	var socket;

	if (!User.name) { $location.path('/index') }
	else { 
		socket = User.socket;
		getUsers(); 
		socket.emit('entered room', User.room);
	}

	_this = this;
	this.user = User;
	this.colors = ['rgb(21,177,240)','rgb(52,173,101)', 'rgb(228,0,121)', 'rgb(247,159,75)', 'rgb(255,242,9)', 'rgb(113,73,151)', 'rgb(41,41,41)', 'rgb(229,0,28)' ]

	$scope.$on('$destroy', function() {
		socket.emit('exited room');
	});

	var canvas = new fabric.Canvas('c', {
		backgroundColor: 'dimgray',
		isDrawingMode: true
	});

	if (canvas.freeDrawingBrush) {
	  canvas.freeDrawingBrush.color = User.color;
	  canvas.freeDrawingBrush.width = 5
	}


	this.setColor = function(color) {
		User.setColor(color);
		socket.emit('changed color', color)
		this.user = User;
		canvas.freeDrawingBrush.color = User.color;
	}


	function getUsers() {
		$http.get('/room/' + User.room).success(function(data, status) {
			var users = data.users
			delete users[User.name];
			_this.users = users;
	  })
	  .error(function(data, status) {
	    console.log("Could not get room info", status);
	  });
	}

	socket.on('entered room', function (data){
		if (data.room === User.room) { 
			_this.users[data.user] = {
				name: data.user,
				color: data.color
			}
		    $scope.$apply();
		}
	})

	socket.on('exited room', function (data){
		if (data.room === User.room) { 
			delete _this.users[data.user];
	    $scope.$apply();
		}
	})

	socket.on('changed color', function (data){
		console.log(data);
		if (data.room === User.room) { 
			console.log("SAME ROOM!")
			_this.users[data.user].color = data.color
	    $scope.$apply();
		}
	})

}]);

