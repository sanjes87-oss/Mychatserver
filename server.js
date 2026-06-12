const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  // Handle joining specific group channels
  socket.on('join_group', (groupName) => {
    socket.join(groupName);
    console.log(`User ${socket.id} joined group: ${groupName}`);
  });

  // Listen for text/file messages sent to a specific group
  socket.on('send_group_message', (data) => {
    // data contains: groupName, text, fileUrl, senderName
    io.to(data.groupName).emit('receive_group_message', {
      sender: data.senderName,
      text: data.text || '',
      fileUrl: data.fileUrl || null,
      timestamp: new Date().toISOString()
    });
  });

  // Track automated user status updates (Online / Away)
  socket.on('update_status', (data) => {
    io.emit('user_status_changed', {
      userId: socket.id,
      status: data.status // 'Online' or 'Away'
    });
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Active on port ${PORT}`));
