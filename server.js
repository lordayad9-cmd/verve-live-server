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

const rooms = {
  "General Chat": [],
  "Music Room": [],
  "Fun Room": [],
  "Games Room": [],
  "Arab Room": []
};

app.get('/', (req, res) => {
  res.send('Verve Live Server is running.');
});

app.post('/login', (req, res) => {
  const nickname = req.body.nickname;
  console.log(nickname + ' logged in.');
  res.json({ success: true });
});

app.get('/messages', (req, res) => {
  const roomName = req.query.room;
  if (!rooms[roomName]) {
    rooms[roomName] = [];
  }
  res.json(rooms[roomName]);
});

app.post('/send', (req, res) => {
  const roomName = req.body.roomName;
  const nickname = req.body.nickname;
  const text = req.body.text;

  if (!rooms[roomName]) {
    rooms[roomName] = [];
  }

  rooms[roomName].push({
    nickname: nickname,
    text: text,
    timestamp: Date.now()
  });

  if (rooms[roomName].length > 100) {
    rooms[roomName] = rooms[roomName].slice(-100);
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log('Verve Live Server running on port ' + PORT);
});
