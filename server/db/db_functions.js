var db = require('./mongoose.js');

var exports = {
	getAllRooms: getAllRooms,
	addRoom: addRoom,
	deleteRoom: deleteRoom,
	// addUserToRoom: addUserToRoom,
	// removeUserFromRoom: removeUserFromRoom,
	getCanvas: getCanvas,
	saveCanvas: saveCanvas
}

function getAllRooms(callback) { 
	db.Room.find()
		.exec(function (err, doc) {
		  if (err) { throw err; }
		  if (doc) {
		  	callback(doc)
		  } else {
		  	callback("Could not get rooms", 403)
		  }
	})
}

function addRoom(name, user) {
	var newRoom = new Room({ name: 'name' });
	newRoom.save(function (err, lobby) {
	  if (err) return console.error(err);
	});
}

function deleteRoom(name) {
	db.Room.findOneAndRemove({name: name})
}

// function addUserToRoom(userID, room, errCallback, successCallback) {
// 	db.userModel.findOneAndUpdate({name: room}, {$push: {users: userID}}, function(err, doc){
// 		if (err) { errCallback(); }
// 		else { successCallback(); }
// 	})
// }

// function removeUserFromRoom(room, userID, errCallback, successCallback) {
// 	postID = ObjectID(postID);
// 	db.userModel.findOneAndUpdate({name: room}, {$pull: {users: {_id: userID}}}, function(err, doc){
// 		if (err) { errCallback() }
// 		else { successCallback(); }
// 		}
// 	)
// }

// function saveNewUser(name, callback) {
// 	var newUser = new db.User({
// 	  username: username,
// 	});

// 	newUser.save(function(err, doc) {
// 	  if (err) { throw err; }
// 	  else { callback(); }
// 	})
// }

function getCanvas(room, callback) {
	db.Room.findOne({name: room}, function(err, doc) {
		if (err) { throw err; }
		else { callback(doc.canvas) }
	})
}

function saveCanvas(room, canvas, callback) {
	db.Room.findOneAndUpdate({name: room}, {canvas: canvas}, function(err, doc) {
		if (err) { throw err; }
		else { callback() }
	})
}


var saveNewPost = exports.saveNewPost = function(username, displayName, title, content, errCallback, successCallback, isPublished) {
	var post = new db.postModel({
		title: title,
		// is_published: isPublished,
		content: content,
		author: displayName,
		username: username
	})

  //Won't write if user not found, but won't throw error either
	db.userModel.findOneAndUpdate({username: username}, {$push: {posts: post}, new: true}, function(err, doc){
		if (err) { errCallback(); }
		else { successCallback(); }
	})
}
