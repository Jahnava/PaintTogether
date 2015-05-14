angular.module('drawTogether.room', [])
.controller('RoomCtrl', ['User','$scope', '$location', '$http', function(User, $scope, $location, $http) {

	var socket;

	if (!User.name) { $location.path('/index') }
	else { 
		socket = User.socket;
		getRoomState(); 
		socket.emit('entered room', User.room);
	}

	_this = this;
	this.user = User;
	this.colors = ['rgb(21,177,240)','rgb(52,173,101)', 'rgb(228,0,121)', 'rgb(247,159,75)', 'rgb(255,242,9)', 'rgb(113,73,151)', 'rgb(41,41,41)', 'rgb(229,0,28)' ]

	$scope.$on('$destroy', function() {
		socket.emit('exited room');
	});

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = "solid";
	ctx.lineWidth = 5;
	ctx.lineCap = "round";
	ctx.strokeStyle = User.color;
	

	var drawing = false;

	function draw(xFrom, yFrom, xTo, yTo, color) {
		ctx.beginPath(); 
		ctx.strokeStyle = color;
		ctx.moveTo(xFrom, yFrom);
		ctx.lineTo(xTo, yTo);
		ctx.stroke();
		ctx.closePath();
	}

	canvas.addEventListener('mousedown', function(e) {
	  drawing = true;
	})

	canvas.addEventListener('mouseup', function(e) {
	  drawing = false;
	  saveCanvas();
	})

	canvas.addEventListener('mousemove', function(e) {
	  if (drawing) {
			var x, y, x1, y1, movementX, movementY;
	  	if (/Firefox/.test(navigator.userAgent)) {
				movementX = e.mozMovementX;
				movementY = e.mozMovementY;
	  	} else if (/Chrome/.test(navigator.userAgent)) {
				movementX = e.movementX;
				movementY = e.movementY;
	  	}
	  	x1 = e.layerX - movementX;
	  	y1 = e.layerY - movementY;
	    x = e.layerX;
	    y = e.layerY;
	    draw(x1, y1, x, y, User.color);
	    socket.emit('draw', {
	      x: x,
	      y: y,
	      x1: x1,
	      y1: y1,
	      color: User.color
	    });
	  }
	});

	socket.on('draw', function(data) {
    draw(data.x1, data.y1, data.x, data.y, data.color);
  });

	this.setColor = function(color) {
		User.setColor(color);
		socket.emit('changed color', color)
		ctx.strokeStyle = color;
		this.user = User;
	}

	this.clearCanvas = function() {
		ctx.clearRect (0, 0, canvas.width, canvas.height );
		saveCanvas();
	}


	function getRoomState() {
		$http.get('/room/' + User.room).success(function(data, status) {
			var users = data.users
			delete users[User.name];
			_this.users = users;
			if (data.canvas) {
				console.log(data.canvas);
				var imageObj = new Image();
        imageObj.onload = function() {
        	ctx.drawImage(this, 0, 0);
       	};
       	imageObj.src = data.canvas;
			}
	  })
	  .error(function(data, status) {
	    console.log("Could not get room info", status);
	  });
	}

	function saveCanvas() {
	  socket.emit('image data', {
	  	room: User.room,
	  	imageData: canvas.toDataURL("image/png")
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

