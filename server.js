const express = require('express');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const PORT = process.env.PORT || 3000;

const reservedAccounts = [
  "Administrator",
  "Anecdote",
  "Book-keeper",
  "arsen477",
  "vic1",
  "Administrators bot",
  "Notifier",
  "Bot",
  "livechat",
  "Jhon doe"
];

const users = {};
reservedAccounts.forEach(function(name, index) {
  users[name] = {
    id: index + 1,
    nickname: name,
    reserved: true
  };
});

let nextUserId = 11;

let nextRoomId = 1;
const rooms = {};

const adminMessages = [];

const chatRooms = {
  "General Chat": [],
  "Music Room": [],
  "Fun Room": [],
  "Games Room": [],
  "Arab Room": []
};

app.get('/', function(req, res) {
  res.send('Verve Live Server is running.');
});

app.post('/login', function(req, res) {
  const nickname = req.body.nickname;

  if (!users[nickname]) {
    users[nickname] = {
      id: nextUserId,
      nickname: nickname
    };
    nextUserId = nextUserId + 1;
  }

  console.log(nickname + ' logged in with ID ' + users[nickname].id);
  res.json({ success: true, id: users[nickname].id });
});

app.get('/messages', function(req, res) {
  const roomName = req.query.room;
  if (!chatRooms[roomName]) {
    chatRooms[roomName] = [];
  }
  res.json(chatRooms[roomName]);
});

app.post('/send', function(req, res) {
  const roomName = req.body.roomName;
  const nickname = req.body.nickname;
  const text = req.body.text;

  if (!chatRooms[roomName]) {
    chatRooms[roomName] = [];
  }

  chatRooms[roomName].push({
    nickname: nickname,
    text: text,
    timestamp: Date.now()
  });

  if (chatRooms[roomName].length > 100) {
    chatRooms[roomName] = chatRooms[roomName].slice(-100);
  }

  res.json({ success: true });
});

app.post('/rooms/create', function(req, res) {
  const roomName = req.body.roomName;
  const owner = req.body.owner;

  const newRoom = {
    id: nextRoomId,
    name: roomName,
    owner: owner,
    founder: owner,
    rating: 0,
    createdAt: Date.now()
  };

  rooms[nextRoomId] = newRoom;
  nextRoomId = nextRoomId + 1;

  console.log('Room created: #' + newRoom.id + ' ' + roomName + ' by ' + owner);
  res.json({ success: true, room: newRoom });
});

app.get('/rooms/list', function(req, res) {
  const allRooms = Object.values(rooms);
  res.json(allRooms);
});

app.get('/rooms/top', function(req, res) {
  const allRooms = Object.values(rooms);
  const sorted = allRooms.sort(function(a, b) {
    return b.rating - a.rating;
  });
  const top10 = sorted.slice(0, 10);
  res.json(top10);
});

app.get('/rooms/owned', function(req, res) {
  const nickname = req.query.nickname;
  const allRooms = Object.values(rooms);
  const owned = allRooms.filter(function(r) {
    return r.owner === nickname;
  });
  res.json(owned);
});

app.post('/admin/message', function(req, res) {
  const nickname = req.body.nickname;
  const message = req.body.message;

  adminMessages.push({
    nickname: nickname,
    message: message,
    timestamp: Date.now()
  });

  console.log('Message to admin from ' + nickname + ': ' + message);
  res.json({ success: true });
});

app.listen(PORT, function() {
  console.log('Verve Live Server running on port ' + PORT);
});
