const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io and allow all cross-origin requests for mobile/desktop apps
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// When a user connects to the server
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for a message from a client
  socket.on('send_message', (data) => {
    console.log(`Message received: ${data.text} from ${data.sender}`);
    
    // Broadcast the message to EVERYONE connected
    io.emit('receive_message', data);
  });

  // When a user closes the app
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Dynamic port allocation for Render, defaulting to 3000 for local testing
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat server running on port ${PORT}`);
});
