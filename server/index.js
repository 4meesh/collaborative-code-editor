const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Store active rooms and their data
const rooms = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join-room', (roomId, username) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        code: '',
        language: 'javascript',
        users: new Map(),
        cursors: new Map()
      });
    }
    
    const room = rooms.get(roomId);
    room.users.set(socket.id, { id: socket.id, username, color: getRandomColor() });
    
    // Send current room state to the new user
    socket.emit('room-state', {
      code: room.code,
      language: room.language,
      users: Array.from(room.users.values())
    });
    
    // Notify other users about the new user
    socket.to(roomId).emit('user-joined', {
      id: socket.id,
      username,
      color: room.users.get(socket.id).color
    });
    
    console.log(`${username} joined room ${roomId}`);
  });

  // Handle code changes
  socket.on('code-change', (roomId, newCode) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = newCode;
      socket.to(roomId).emit('code-updated', newCode);
    }
  });

  // Handle language changes
  socket.on('language-change', (roomId, language) => {
    const room = rooms.get(roomId);
    if (room) {
      room.language = language;
      socket.to(roomId).emit('language-updated', language);
    }
  });

  // Handle cursor position updates
  socket.on('cursor-update', (roomId, position) => {
    const room = rooms.get(roomId);
    if (room) {
      room.cursors.set(socket.id, position);
      socket.to(roomId).emit('cursor-moved', {
        userId: socket.id,
        position,
        username: room.users.get(socket.id)?.username,
        color: room.users.get(socket.id)?.color
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms they were in
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        room.cursors.delete(socket.id);
        
        // Notify other users about the departure
        socket.to(roomId).emit('user-left', socket.id);
        
        // If room is empty, clean it up
        if (room.users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    }
  });
});

// API Routes
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.keys()).map(roomId => ({
    id: roomId,
    userCount: rooms.get(roomId).users.size
  }));
  res.json(roomList);
});

app.post('/api/rooms', (req, res) => {
  const roomId = uuidv4();
  rooms.set(roomId, {
    id: roomId,
    code: '',
    language: 'javascript',
    users: new Map(),
    cursors: new Map()
  });
  res.json({ roomId });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Utility function to generate random colors for users
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 