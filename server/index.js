// Setup basic express server
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var Firebase = require("firebase");

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/..'));

var rooms = {
  Lobby: {
    name: 'Lobby',
    users: {},
  }
};

/************* ROUTES *************/

app.get('/hallway', function(req,res) {
  var roomList = [];
  var fb = new Firebase("https://painttogther.firebaseio.com/rooms");
  fb.on("value", function(snapshot) {
    var rooms = snapshot.val()
    for (var room in rooms) { 
      roomList.push(room); 
    }
    res.end(JSON.stringify(roomList));
  }, function (errorObject) {
    // console.log("The read failed: " + errorObject.code);
  });
})

app.get('/room/:id', function(req,res) {
  var fb = new Firebase("https://painttogther.firebaseio.com/rooms/"+req.params.id);
  fb.on("value", function(snapshot) {
    res.end(JSON.stringify(snapshot.val()));
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
})

app.post('/newRoom', function(req,res) {
  var fb = new Firebase("https://painttogther.firebaseio.com/rooms");
  var room = req.body.room
  fb.child(room).set({name: room, users: {}, canvas: ''});
  res.end(room);
})

/************* SOCKETS *************/

io.on('connection', function (socket) {

  socket.on('add user', function (user) {
    socket.username = user.name;
    socket.color = user.color
    socket.id = user.id
    addedUser = true;
  });

  socket.on('entered room', function (room) {
    socket.room = room;
    var fb = new Firebase("https://painttogther.firebaseio.com/rooms/"+room+"/users");
    fb.child(socket.id).set({
      name: socket.username,
      color: socket.color
    });
    socket.broadcast.emit('entered room', {
      room: socket.room,
      name: socket.username,
      id: socket.id,
      color: socket.color
    });
  });

  socket.on('exited room', function() {
    exitedRoom();
  });

  socket.on('deleted room', function(room) {
    var fb = new Firebase("https://painttogther.firebaseio.com/rooms/"+room);
    fb.remove();
    socket.broadcast.emit('rooms changed');
  })

  socket.on('added room', function() {
    socket.broadcast.emit('rooms changed');
  })

  socket.on('changed color', function(color) {
    socket.color = color
    var fb = new Firebase("https://painttogther.firebaseio.com/rooms/"+socket.room+"/users/"+socket.id+"/color");
    fb.set(color);
    socket.broadcast.emit('changed color', {
      room: socket.room,
      user: socket.username,
      id: socket.id,
      color: color
    });
  });

  socket.on('draw', function(data) {
    socket.broadcast.emit('draw', {
      room: socket.room,
      color: socket.color,
      x: data.x,
      y: data.y,
      x1: data.x1,
      y1: data.y1
    });
  });

  socket.on('image data', function(data) {
    var fb = new Firebase("https://painttogther.firebaseio.com/rooms/"+data.room+"/canvas");
    fb.set(data.imageData);
  })

  socket.on('clear', function(room) {
    socket.broadcast.emit('clear', room);
  })

  socket.on('disconnect', function() {
    exitedRoom();
  });


  /************* HELPER FUNCTIONS *************/

  function exitedRoom() {
    if (socket.room) {
      var fb = new Firebase("https://painttogther.firebaseio.com/rooms/"+socket.room);
      fb.on("value", function(snapshot) {
        if (snapshot.val()) {
          var ref = new Firebase("https://painttogther.firebaseio.com/rooms/"+socket.room+"/users/"+socket.id);
          ref.remove();
          socket.broadcast.emit('exited room', {
            room: socket.room,
            user: socket.username,
            id: socket.id
          });
        }
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    }
  }
});