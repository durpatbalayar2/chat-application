const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

const users = new Map();
const rooms = new Set(['general']);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (username, callback) => {
        console.log('Received join event for:', username);
        if (users.has(username)) {
            if (callback) callback({ success: false, message: 'Username already taken' });
            socket.emit('error', 'Username already taken');
            return;
        }
        users.set(username, socket.id);
        socket.username = username;
        socket.join('general');
        io.emit('userJoined', username);
        io.emit('userList', Array.from(users.keys()));
        if (callback) callback({ success: true });
    });

    socket.on('message', (data) => {
        io.to(data.room).emit('message', {
            user: socket.username,
            text: data.text,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('createRoom', (roomName) => {
        if (!rooms.has(roomName)) {
            rooms.add(roomName);
            io.emit('roomList', Array.from(rooms));
        }
    });

    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        socket.emit('roomJoined', roomName);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            users.delete(socket.username);
            io.emit('userLeft', socket.username);
            io.emit('userList', Array.from(users.keys()));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
}); 