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

	var offset, x, y;
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = "solid";
	ctx.lineWidth = 5;
	ctx.lineCap = "round";
	ctx.strokeStyle = User.color;
	

	var drawing = false;

	function draw(x, y) {
	  ctx.lineTo(x, y);
	  return ctx.stroke();
	};

	canvas.addEventListener('mousedown', function(e) {
	  ctx.beginPath();
	  drawing = true;
	})

	canvas.addEventListener('mouseup', function(e) {
	  drawing = false;
	  socket.emit('drawEnd');
	  ctx.closePath();
	})

	canvas.addEventListener('mousemove', function(e) {
	  if (drawing) {
	    x = e.offsetX;
	    y = e.offsetY;
	    draw(x, y);
	    socket.emit('drawClick', {
	      x: x,
	      y: y,
	    });
	  }
	});

	socket.on('draw', function(data) {
		ctx.strokeStyle = data.color;
    draw(data.x, data.y);
		ctx.strokeStyle = User.color;
  });

	socket.on('drawStart', function() {
		ctx.beginPath();
		drawing = true;
	})

	socket.on('drawEnd', function() {
		drawing = false;
		return ctx.closePath();
	})

	this.setColor = function(color) {
		User.setColor(color);
		socket.emit('changed color', color)
		ctx.strokeStyle = color;
		this.user = User;
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
	});

	socket.on('exited room', function (data){
		if (data.room === User.room) { 
			delete _this.users[data.user];
	    $scope.$apply();
		}
	});

	socket.on('changed color', function (data){
		console.log(data);
		if (data.room === User.room) { 
			_this.users[data.user].color = data.color
	    $scope.$apply();
		}
	});

}]);

