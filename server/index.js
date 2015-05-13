// Setup basic express server
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/..'));

// usernames which are currently connected to the chat
var rooms = {
  Lobby: {
    name: 'Lobby',
    users: {
      user1: {name: 'user1', color: 'blue'},
      user2: {name: 'user2', color: 'green'}
    }
  }
};

app.get('/hallway', function(req,res) {
  res.end(JSON.stringify(rooms));
})

app.get('/room/:id', function(req,res) {
  res.end(JSON.stringify(rooms[req.params.id]));
})

app.post('/newRoom', function(req,res) {
  var room = req.body.room
  rooms[room] = {name: room, users: {}};
  res.end(room);
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
    console.log(room)
    console.log(socket.username)
    console.log(socket.color)
    socket.room = room;
    rooms[room].users[socket.username] = {
      name: socket.username,
      color: socket.color
    }
  });

  socket.on('exited room', function() {
    delete rooms[socket.room].users[socket.username];
    socket.broadcast.emit('exited room', {
      username: socket.username
    });
  });

  // when the client emits 'typing', we broadcast it to others
  // socket.on('typing', function () {
  //   socket.broadcast.emit('typing', {
  //     username: socket.username
  //   });
  // });

  // // when the client emits 'stop typing', we broadcast it to others
  // socket.on('stop typing', function () {
  //   socket.broadcast.emit('stop typing', {
  //     username: socket.username
  //   });
  // });

  // // when the user disconnects.. perform this
  // socket.on('disconnect', function () {
  //   // remove the username from global usernames list
  //   if (addedUser) {
  //     delete usernames[socket.username];
  //     --numUsers;

  //     // echo globally that this client has left
  //     socket.broadcast.emit('user left', {
  //       username: socket.username,
  //       numUsers: numUsers
  //     });
  //   }
  // });
});