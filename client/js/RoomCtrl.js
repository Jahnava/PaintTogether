(function(){
  'use strict';

	angular.module('drawTogether.room', [])
	.controller('RoomCtrl', ['User','$scope', '$location', '$http', Room ]);

	function Room(User, $scope, $location, $http) {

		var socket;

		if (!User.name) { $location.path('/index') }
		else { 
			socket = User.socket;
			getRoomState(); 
			socket.emit('entered room', User.room);
		}

		var room = this;
		room.user = User;
		room.lastUser = false;
		room.eraseCursor = false;
		room.colors = ['rgb(21,177,240)','rgb(52,173,101)', 'rgb(228,0,121)', 'rgb(247,159,75)', 'rgb(255,242,9)', 'rgb(113,73,151)', 'rgb(41,41,41)', 'rgb(229,0,28)', 'lightgray' ]

		// User exits room if they navigate away from page
		$scope.$on('$destroy', function() {
			socket.emit('exited room');
			delete User.room;
		});

		// Set canvas  defaults
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = "solid";
		ctx.lineWidth = 5;
		ctx.lineCap = "round";
		ctx.strokeStyle = User.color;
		var drawing = false;

		/************* DRAWING FUNCTIONS ***************/

		function draw(xFrom, yFrom, xTo, yTo, color) {
			ctx.beginPath(); 
			ctx.strokeStyle = color;
			color === 'lightgray' ? ctx.lineWidth = 80 : ctx.lineWidth = 5;
			ctx.moveTo(xFrom, yFrom);
			ctx.lineTo(xTo, yTo);
			ctx.stroke();
			ctx.closePath();
		}

		canvas.addEventListener('mousedown', function(e) {
		  drawing = true;
		  draw(e.layerX-1, e.layerY, e.layerX, e.layerY, User.color);
		  socket.emit('draw', {
		    x: e.layerX,
		    y: e.layerY,
		    x1: e.layerX-1,
		    y1: e.layerY,
		    color: User.color
		  });
		})

		window.addEventListener('mouseup', function(e) {
		  if (drawing) { saveCanvas(); }
		  drawing = false;
		})

		canvas.addEventListener('mousemove', function(e) {
			e.preventDefault();
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

		room.setColor = function(color) {
			User.setColor(color);
			color === 'lightgray' ? room.eraseCursor = true : room.eraseCursor = false;
			socket.emit('changed color', color)
			ctx.strokeStyle = color;
		}

		room.clearCanvas = function() {
			ctx.clearRect (0, 0, canvas.width, canvas.height);
			saveCanvas();
			socket.emit('clear', {room: User.room});
			room.clearSure = false;
		}

		function saveCanvas() {
		  socket.emit('image data', {
		  	room: User.room,
		  	imageData: canvas.toDataURL("image/png")
			});
		}

		/***************** ROOM FUNCTIONS ****************/

		room.deleteRoom = function() {
			socket.emit('deleted room', User.room);
			$location.path('/hallway');
		}


		function getRoomState() {
			$http.get('/room/' + User.room).success(function(data, status) {
				room.users = {};
				if (data.users) {
					room.users = data.users
					delete room.users[User.id];
				} 
				if (!Object.keys(room.users).length) { room.lastUser = true; }
				// Load/render canvas state
				if (data.canvas) {
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

		/************* SOCKET LISTENERS *************/

		socket.on('entered room', function (data){
			if (data.room === User.room && data.id !== User.id) { 
				room.users[data.id] = {
					name: data.name,
					color: data.color
				}
				Object.keys(room.users).length ? room.lastUser = false : room.lastUser = true;
		    $scope.$apply();
			}
		});

		socket.on('exited room', function (data){
			if (data.room === User.room && data.id !== User.id) { 
				delete room.users[data.id];
				Object.keys(room.users).length ? room.lastUser = false : room.lastUser = true;
		    $scope.$apply();
			}
		});

		socket.on('changed color', function (data){
			if (data.room === User.room && data.id !== User.id) { 
				room.users[data.id].color = data.color
		    $scope.$apply();
			}
		});

		socket.on('draw', function (data) {
			if (data.room === User.room && data.id !== User.id) {
		    draw(data.x1, data.y1, data.x, data.y, data.color);
		  }
	  });

		socket.on('clear', function (data){
			if (data.room === User.room) {
				ctx.clearRect (0, 0, canvas.width, canvas.height);
			}
		});

	}
})();
