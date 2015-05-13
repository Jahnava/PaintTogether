angular.module('drawTogether')
.factory('User', function() {
	var user = {};

	user.socket = io();

	user.setName = function(name) {
		user.name = name;
	}

	user.setColor = function(color) {
		user.color = color;
	}

	user.setRoom = function(room) {
		user.room = room;
	}

	user.exitRoom = function() {
		user.room = undefined;
	}

  return user;
});