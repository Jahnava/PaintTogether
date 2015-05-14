// Setup basic express server
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Routing
app.use(express.static(__dirname + '/..'));

// usernames which are currently connected to the chat
var rooms = {
  Lobby: {
    name: 'Lobby',
    users: {},
  }
};

app.get('/hallway', function(req,res) {
  var roomList = [];
  for (var room in rooms) { roomList.push(room); }
  res.end(JSON.stringify(roomList));
})

app.get('/room/:id', function(req,res) {
  res.end(JSON.stringify(rooms[req.params.id]));
})

app.post('/newRoom', function(req,res) {
  var room = req.body.room
  rooms[room] = {name: room, users: {}, canvas: ''};
  res.end(room);
})

app.post('/room/:id', function(req, res) {
  console.log(req.body);
})

io.on('connection', function (socket) {
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', function (user) {
    socket.username = user.name;
    socket.color = user.color
    addedUser = true;
  });

  socket.on('entered room', function (room) {
    socket.room = room;
    rooms[room].users[socket.username] = {
      name: socket.username,
      color: socket.color
    }
    socket.broadcast.emit('entered room', {
      room: socket.room,
      user: socket.username,
      color: socket.color
    });
  });

  socket.on('exited room', function() {
    exitedRoom();
  });

  socket.on('changed color', function(color) {
    socket.color = color
    rooms[socket.room].users[socket.username].color = color;
    socket.broadcast.emit('changed color', {
      room: socket.room,
      user: socket.username,
      color: color
    });
  });

  socket.on('disconnect', function() {
    console.log(socket.username + ' DISCONNECTED')
    exitedRoom();
  });

  socket.on('draw', function(data) {
    socket.broadcast.emit('draw', {
      color: socket.color,
      x: data.x,
      y: data.y,
      x1: data.x1,
      y1: data.y1
    });
  });

  socket.on('image data', function(data) {
    console.log(data.imageData);
    rooms[data.room].canvas = data.imageData;
  })

  function exitedRoom() {
    if (socket.room) {
      delete rooms[socket.room].users[socket.username];
      socket.broadcast.emit('exited room', {
        room: socket.room,
        user: socket.username
      });
    }
  }
});