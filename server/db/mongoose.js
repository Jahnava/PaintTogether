var mongoose = require('mongoose');
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/test';
mongoose.connect(uristring)

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
// });

// Schema
var roomSchema = mongoose.Schema({
  name: String,
  data: String,
  // users: [User]
});

var userSchema = mongoose.Schema({
  name: String,
  color: String,
  room: String,
  // id: Schema.Types.ObjectId
})

var Room = exports.Room = mongoose.model('Room', roomSchema)
var User = exports.User = mongoose.model('User', userSchema)

// Seed Lobby
var lobby = new Room({ name: 'Lobby' });
lobby.save(function (err, lobby) {
  if (err) return console.error(err);
});
