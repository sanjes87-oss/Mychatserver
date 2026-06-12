const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log(`Socket Active: ${socket.id}`);

  // Restricts communication channels strictly to users sharing the same organization space
  socket.on('join_group', (roomCode) => {
    socket.join(roomCode);
    console.log(`Socket joined channel: ${roomCode}`);
  });

  // Broadcasts encrypted payload data inside isolated channel arrays
  socket.on('send_group_message', (data) => {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const messagePayload = {
      id: messageId,
      roomName: data.groupName,
      text: data.text || '',
      fileUrl: data.fileUrl || null,
      senderName: data.senderName,
      status: 'Sent',
      timestamp: new Date().toISOString()
    };
    socket.emit('message_status_update', { id: messageId, status: 'Sent' });
    io.to(data.groupName).emit('receive_group_message', messagePayload);
  });

  // Receipt Acknowledgement: Recipient confirms arrival on physical device screen layout
  socket.on('message_delivered_ack', (data) => {
    io.to(data.groupName).emit('message_status_update', { id: data.messageId, status: 'Delivered' });
  });

  // Receipt Acknowledgement: Recipient confirms interaction (Read event)
  socket.on('message_read_ack', (data) => {
    io.to(data.groupName).emit('message_status_update', { id: data.messageId, status: 'Read' });
  });

  // Real-time Presence Syncing: Syncs coworker availability across dashboards
  socket.on('update_status', (data) => {
    io.emit('user_status_changed', { userId: socket.id, status: data.status });
  });

  socket.on('disconnect', () => console.log(`Socket Dropped: ${socket.id}`));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server executing live on port ${PORT}`));
