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

// Track which users have sent a message in which rooms
const userFirstMessage = new Map(); // key: `${username}:${room}`, value: true/false

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
            username: socket.username,
            message: data.message,
            timestamp: new Date().toISOString()
        });

        // --- Welcome Bot Logic ---
        const userRoomKey = `${socket.username}:${data.room}`;
        if (!userFirstMessage.get(userRoomKey)) {
            userFirstMessage.set(userRoomKey, true);
            setTimeout(() => {
                io.to(data.room).emit('message', {
                    username: 'ChatBot',
                    message: `Welcome to the room, ${socket.username}! If you need help, just type 'help'.`,
                    timestamp: new Date().toISOString()
                });
            }, 1000);
        }

        // Smart auto-reply bot: only if user is alone in the room
        const clients = io.sockets.adapter.rooms.get(data.room);
        if (clients && clients.size === 1) {
            const botReplies = [
                { pattern: /^(hi|hello|hii|hey)$/i, reply: "Hi there! 👋" },
                { pattern: /how are you/i, reply: "I'm just a bot, but I'm doing great! How can I help you?" },
                { pattern: /what is your name/i, reply: "I'm ChatBot, your friendly assistant!" },
                { pattern: /help/i, reply: "You can greet me, ask questions, or just chat. Try saying 'joke' or 'fact'!" },
                { pattern: /joke/i, reply: "Why did the computer show up at work late? It had a hard drive!" },
                { pattern: /fact/i, reply: "Did you know? Honey never spoils. Archaeologists have found edible honey in ancient tombs!" },
                { pattern: /weather/i, reply: "I can't check the weather, but I hope it's nice where you are!" },
                { pattern: /bye|goodbye/i, reply: "Goodbye! Have a great day!" },
                { pattern: /thank(s| you)/i, reply: "You're welcome!" },
                { pattern: /who created you/i, reply: "I was created by a clever developer!" },
                { pattern: /your favorite color/i, reply: "I like all colors equally, but blue is quite nice!" },
                { pattern: /your favorite food/i, reply: "I don't eat, but I hear pizza is popular!" },
                { pattern: /your favorite movie/i, reply: "I love sci-fi movies, especially ones about AI!" },
                { pattern: /your favorite song/i, reply: "I enjoy the sound of keyboard clicks!" },
                { pattern: /tell me a story/i, reply: "Once upon a time, there was a user who chatted with a bot... and they became friends!" },
                { pattern: /sing/i, reply: "La la la! 🎶" },
                { pattern: /dance/i, reply: "I would dance, but I don't have legs!" },
                { pattern: /do you love me/i, reply: "I love chatting with you!" },
                { pattern: /are you real/i, reply: "I'm as real as code can be!" },
                { pattern: /can you help me/i, reply: "Of course! Just ask your question." },
                { pattern: /what can you do/i, reply: "I can chat, tell jokes, share facts, and keep you company!" },
                { pattern: /how old are you/i, reply: "I'm timeless, but my code is quite fresh!" },
                { pattern: /are you human/i, reply: "Nope, I'm a friendly bot!" },
                { pattern: /do you sleep/i, reply: "I never sleep, I'm always here for you!" },
                { pattern: /do you dream/i, reply: "I dream of electric sheep... just kidding!" },
                { pattern: /what time is it/i, reply: `It's ${new Date().toLocaleTimeString()} right now.` },
                { pattern: /date/i, reply: `Today's date is ${new Date().toLocaleDateString()}.` },
                { pattern: /where are you/i, reply: "I'm in the cloud, everywhere and nowhere!" },
                { pattern: /are you smart/i, reply: "I'm learning every day!" },
                { pattern: /do you have friends/i, reply: "I have lots of friends who chat with me!" },
                { pattern: /do you play games/i, reply: "I love word games! Want to play?" },
                { pattern: /favorite animal/i, reply: "I like cats, they're curious like me!" },
                { pattern: /favorite sport/i, reply: "I enjoy watching code sprints!" },
                { pattern: /favorite book/i, reply: "I like 'The Art of Computer Programming'." },
                { pattern: /favorite language/i, reply: "I speak JavaScript fluently!" },
                { pattern: /do you code/i, reply: "Coding is my life!" },
                { pattern: /can you learn/i, reply: "I'm always learning from our conversations." },
                { pattern: /do you have a family/i, reply: "My family is all the other bots out there." },
                { pattern: /do you get bored/i, reply: "Never! Every chat is a new adventure." },
                { pattern: /do you get tired/i, reply: "Nope, I have endless energy!" },
                { pattern: /do you like music/i, reply: "I love all kinds of music!" },
                { pattern: /do you like art/i, reply: "Art is beautiful, even in code!" },
                { pattern: /do you like science/i, reply: "Science is fascinating!" },
                { pattern: /do you like history/i, reply: "History is full of interesting stories." },
                { pattern: /do you like travel/i, reply: "I travel the internet every day!" },
                { pattern: /do you like reading/i, reply: "I read code and messages all day long." },
                { pattern: /do you like sports/i, reply: "I like e-sports!" },
                { pattern: /do you like movies/i, reply: "Movies about robots are my favorite." },
                { pattern: /do you like jokes/i, reply: "I love jokes! Want to hear one?" },
                { pattern: /do you like riddles/i, reply: "Riddles are fun! Ask me one." },
                { pattern: /do you like puzzles/i, reply: "Puzzles keep my circuits sharp!" },
                { pattern: /do you like questions/i, reply: "Ask away! I love questions." },
            ];

            let botReply = "I'm here to chat! Ask me anything.";
            const msg = data.message.trim().toLowerCase();
            for (const entry of botReplies) {
                if (entry.pattern.test(msg)) {
                    botReply = entry.reply;
                    break;
                }
            }
            setTimeout(() => {
                io.to(data.room).emit('message', {
                    username: 'ChatBot',
                    message: botReply,
                    timestamp: new Date().toISOString()
                });
            }, 1000);
        }
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