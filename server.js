const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Expecting structured profile details from the Flutter app
  socket.on('send_message', (data) => {
    const payload = {
      text: data.text,
      senderId: data.senderId,
      firstName: data.firstName || 'Anonymous',
      lastName: data.lastName || '',
      gender: data.gender || 'Not specified',
      timestamp: new Date().toISOString()
    };
    
    console.log(`Message from ${payload.firstName}: ${payload.text}`);
    
    // Distribute the message and profile to everyone online
    io.emit('receive_message', payload);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat server running on port ${PORT}`);
});
