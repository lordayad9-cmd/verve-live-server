const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const PORT = process.env.PORT || 3000;
const DATA_FILE = './data.json';

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

function getDefaultData() {
  const users = {};
  reservedAccounts.forEach(function(name, index) {
    users[name] = {
      id: index + 1,
      nickname: name,
      reserved: true
    };
  });

  return {
    nextUserId: 11,
    users: users,
    nextRoomId: 1,
    rooms: {},
    adminMessages: [],
    contacts: {},
    chatRooms: {
      "General Chat": [],
      "Music Room": [],
      "Fun Room": [],
      "Games Room": [],
      "Arab Room": []
    }
  };
}

let data = getDefaultData();

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(raw);
      if (!data.contacts) {
        data.contacts = {};
      }
      console.log('Data loaded from file.');
    } else {
      console.log('No existing data file, starting fresh.');
    }
  } catch (e) {
    console.log('Error loading data: ' + e.message);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
  } catch (e) {
    console.log('Error saving data: ' + e.message);
  }
}

loadData();

app.get('/', function(req, res) {
  res.send('Verve Live Server is running.');
});

app.post('/login', function(req, res) {
  const nickname = req.body.nickname;

  if (!data.users[nickname]) {
    data.users[nickname] = {
      id: data.nextUserId,
      nickname: nickname
    };
    data.nextUserId = data.nextUserId + 1;
    saveData();
  }

  console.log(nickname + ' logged in with ID ' + data.users[nickname].id);
  res.json({ success: true, id: data.users[nickname].id });
});

app.get('/messages', function(req, res) {
  const roomName = req.query.room;
  if (!data.chatRooms[roomName]) {
    data.chatRooms[roomName] = [];
  }
  res.json(data.chatRooms[roomName]);
});

app.post('/send', function(req, res) {
  const roomName = req.body.roomName;
  const nickname = req.body.nickname;
  const text = req.body.text;

  if (!data.chatRooms[roomName]) {
    data.chatRooms[roomName] = [];
  }

  data.chatRooms[roomName].push({
    nickname: nickname,
    text: text,
    timestamp: Date.now()
  });

  if (data.chatRooms[roomName].length > 100) {
    data.chatRooms[roomName] = data.chatRooms[roomName].slice(-100);
  }

  saveData();
  res.json({ success: true });
});

app.post('/rooms/create', function(req, res) {
  const roomName = req.body.roomName;
  const owner = req.body.owner;

  const newRoom = {
    id: data.nextRoomId,
    name: roomName,
    owner: owner,
    founder: owner,
    rating: 0,
    createdAt: Date.now()
  };

  data.rooms[data.nextRoomId] = newRoom;
  data.nextRoomId = data.nextRoomId + 1;
  saveData();

  console.log('Room created: #' + newRoom.id + ' ' + roomName + ' by ' + owner);
  res.json({ success: true, room: newRoom });
});

app.get('/rooms/list', function(req, res) {
  const allRooms = Object.values(data.rooms);
  res.json(allRooms);
});

app.get('/rooms/top', function(req, res) {
  const allRooms = Object.values(data.rooms);
  const sorted = allRooms.sort(function(a, b) {
    return b.rating - a.rating;
  });
  const top10 = sorted.slice(0, 10);
  res.json(top10);
});

app.get('/rooms/owned', function(req, res) {
  const nickname = req.query.nickname;
  const allRooms = Object.values(data.rooms);
  const owned = allRooms.filter(function(r) {
    return r.owner === nickname;
  });
  res.json(owned);
});

app.post('/admin/message', function(req, res) {
  const nickname = req.body.nickname;
  const message = req.body.message;

  data.adminMessages.push({
    nickname: nickname,
    message: message,
    timestamp: Date.now()
  });

  saveData();
  console.log('Message to admin from ' + nickname + ': ' + message);
  res.json({ success: true });
});

app.post('/contacts/add', function(req, res) {
  const owner = req.body.owner;
  const contactNick = req.body.contactNick;

  if (!data.contacts[owner]) {
    data.contacts[owner] = [];
  }

  if (data.contacts[owner].indexOf(contactNick) === -1) {
    data.contacts[owner].push(contactNick);
    saveData();
  }

  res.json({ success: true });
});

app.get('/contacts/list', function(req, res) {
  const owner = req.query.owner;

  if (!data.contacts[owner]) {
    data.contacts[owner] = [];
  }

  res.json(data.contacts[owner]);
});

app.listen(PORT, function() {
  console.log('Verve Live Server running on port ' + PORT);
});
