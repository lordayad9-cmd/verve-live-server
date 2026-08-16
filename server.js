const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

const connectedUsers = {};

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

io.on('connection', (socket) => {
  console.log('User connected: ' + socket.id);

  socket.on('user_login', (data) => {
    const nickname = data.nickname;
    connectedUsers[socket.id] = { nickname: nickname };
    console.log(nickname + ' logged in.');
  });

  socket.on('join_room', (data) => {
    const roomName = data.roomName;
    socket.join(roomName);

    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }

    socket.emit('room_history', rooms[roomName]);

    console.log(socket.id + ' joined ' + roomName);
  });

  socket.on('send_message', (data) => {
    const roomName = data.roomName;
    const nickname = data.nickname;
    const text = data.text;

    const message = {
      nickname: nickname,
      text: text,
      timestamp: Date.now()
    };

    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }
    rooms[roomName].push(message);

    io.to(roomName).emit('new_message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
    delete connectedUsers[socket.id];
  });
});

server.listen(PORT, () => {
  console.log('Verve Live Server running on port ' + PORT);
});
