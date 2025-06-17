class ChatApp {
    constructor() {
        this.socket = window.auth.socket;
        this.currentRoom = null;
        this.rooms = new Set();
        this.users = new Set();
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSocketListeners();
    }

    initializeElements() {
        this.messageArea = document.getElementById('messageArea');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.roomList = document.getElementById('roomList');
        this.userList = document.getElementById('userList');
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.newRoomName = document.getElementById('newRoomName');
        this.currentRoomTitle = document.getElementById('currentRoom');
        this.formatButtons = document.querySelectorAll('.format-btn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.toggleThemeBtn = document.getElementById('toggleThemeBtn');
        this.emojiPickerBtn = document.querySelector('.format-btn[data-format="emoji"]');
        this.emojiPicker = document.getElementById('emojiPicker');
        this.emojiList = document.querySelector('#emojiPicker .emoji-list');
        this.toastContainer = document.getElementById('toastContainer');
        this.typingIndicator = document.getElementById('typingIndicator');

        // Debugging element existence
        console.log('Elements initialized:', {
            messageArea: !!this.messageArea,
            messageInput: !!this.messageInput,
            sendBtn: !!this.sendBtn,
            emojiPickerBtn: !!this.emojiPickerBtn,
            emojiPicker: !!this.emojiPicker,
            emojiList: !!this.emojiList,
            typingIndicator: !!this.typingIndicator
        });

        // Ensure messageArea exists
        if (!this.messageArea) {
            console.error('Message area element not found!');
            return;
        }
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Typing indicator events
        let typingTimer;
        const doneTypingInterval = 1000; // 1 second

        this.messageInput.addEventListener('input', () => {
            this.socket.emit('typing', this.currentRoom);
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                this.socket.emit('stop typing', this.currentRoom);
            }, doneTypingInterval);
        });

        this.messageInput.addEventListener('blur', () => {
            // In case the user blurs before the timer runs out
            clearTimeout(typingTimer);
            this.socket.emit('stop typing', this.currentRoom);
        });

        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.newRoomName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createRoom();
            }
        });

        this.formatButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleFormatting(btn.dataset.format));
        });

        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.toggleThemeBtn.addEventListener('click', () => this.toggleTheme());
        if (this.emojiPickerBtn) {
            this.emojiPickerBtn.addEventListener('click', (e) => this.toggleEmojiPicker(e));
        }

        // Close emoji picker if clicked outside
        document.addEventListener('click', (e) => {
            if (this.emojiPicker && !this.emojiPicker.contains(e.target) && this.emojiPickerBtn && !this.emojiPickerBtn.contains(e.target)) {
                this.emojiPicker.classList.add('hidden');
            }
        });

        this.populateEmojis();
    }

    initializeSocketListeners() {
        this.socket.on('message', (data) => {
            console.log('Received message:', data);
            this.handleNewMessage(data);
        });
        this.socket.on('roomList', (rooms) => this.updateRoomList(rooms));
        this.socket.on('userList', (users) => this.updateUserList(users));
        this.socket.on('userJoined', (data) => this.handleUserJoined(data));
        this.socket.on('userLeft', (data) => this.handleUserLeft(data));
        this.socket.on('roomCreated', (room) => this.handleRoomCreated(room));
        this.socket.on('typing', (data) => this.handleTyping(data));
        this.socket.on('stop typing', (data) => this.handleStopTyping(data));
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (message && this.currentRoom) {
            console.log('Sending message:', message, 'to room:', this.currentRoom);
            const formattedMessage = this.formatMessage(message);
            this.socket.emit('message', {
                room: this.currentRoom,
                message: formattedMessage,
                timestamp: new Date().toISOString()
            });
            this.messageInput.value = '';
        } else {
            console.log('Cannot send message:', { message, currentRoom: this.currentRoom });
            if (!this.currentRoom) {
                this.showToast('Please join a room before sending messages.', 'error');
            } else if (!message) {
                this.showToast('Message cannot be empty.', 'error');
            }
        }
    }

    formatMessage(message) {
        // Basic formatting
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
        message = message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        return message;
    }

    handleFormatting(format) {
        const input = this.messageInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        let formattedText = '';

        switch (format) {
            case 'bold':
                formattedText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end);
                break;
            case 'italic':
                formattedText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end);
                break;
            case 'link':
                formattedText = text.substring(0, start) + '[' + text.substring(start, end) + '](url)' + text.substring(end);
                input.setSelectionRange(start + 1, start + 1 + text.substring(start, end).length);
                break;
            case 'code':
                formattedText = text.substring(0, start) + '`' + text.substring(start, end) + '`' + text.substring(end);
                break;
            case 'emoji':
                // Handled by toggleEmojiPicker
                return;
        }

        input.value = formattedText;
        input.focus();

        // Adjust cursor position for bold/italic/code
        if (format === 'bold' || format === 'italic' || format === 'code') {
            input.setSelectionRange(end + 2, end + 2);
        }
    }

    handleNewMessage(data) {
        console.log('Handling new message:', data);
        if (!this.messageArea) {
            console.error('Message area not initialized');
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${data.username === window.auth.getCurrentUser() ? 'sent' : 'received'}`;
        
        const username = document.createElement('div');
        username.className = 'username';
        username.textContent = data.username;
        
        const content = document.createElement('div');
        content.className = 'content';
        content.innerHTML = data.message;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(data.timestamp).toLocaleTimeString();
        
        messageDiv.appendChild(username);
        messageDiv.appendChild(content);
        messageDiv.appendChild(timestamp);
        
        this.messageArea.appendChild(messageDiv);
        this.messageArea.scrollTop = this.messageArea.scrollHeight;
    }

    createRoom() {
        const roomName = this.newRoomName.value.trim();
        if (roomName) {
            this.socket.emit('createRoom', roomName);
            this.newRoomName.value = '';
        }
    }

    joinRoom(roomName) {
        if (this.currentRoom) {
            this.socket.emit('leaveRoom', this.currentRoom);
        }
        this.currentRoom = roomName;
        this.currentRoomTitle.textContent = roomName;
        this.socket.emit('joinRoom', roomName);
        this.messageArea.innerHTML = '';
    }

    updateRoomList(rooms) {
        this.roomList.innerHTML = '';
        rooms.forEach(room => {
            const li = document.createElement('li');
            li.textContent = room;
            li.addEventListener('click', () => this.joinRoom(room));
            this.roomList.appendChild(li);
        });
    }

    updateUserList(users) {
        this.userList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            this.userList.appendChild(li);
        });
    }

    handleUserJoined(data) {
        const message = `${data.username} joined the room`;
        this.addSystemMessage(message);
    }

    handleUserLeft(data) {
        const message = `${data.username} left the room`;
        this.addSystemMessage(message);
    }

    handleRoomCreated(room) {
        this.rooms.add(room);
        this.updateRoomList(Array.from(this.rooms));
    }

    addSystemMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.textContent = message;
        this.messageArea.appendChild(messageDiv);
        this.messageArea.scrollTop = this.messageArea.scrollHeight;
    }

    clearChat() {
        this.messageArea.innerHTML = '';
        this.showToast('Chat cleared!', 'success');
    }

    toggleTheme() {
        const currentTheme = document.body.dataset.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        // Update icon
        this.toggleThemeBtn.querySelector('i').className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        this.showToast(`Switched to ${newTheme} theme`, 'info');
    }

    populateEmojis() {
        console.log('Populating emojis...');
        const emojis = [
            '👍', '😂', '❤️', '🔥', '🤔', '🤩', '🥳', '👏',
            '🎉', '💯', '👋', '🙏', '💡', '✨', '🚀', '✅',
            '❌', '❓', '❗', '⬆️', '⬇️', '➡️', '⬅️', '🌐'
        ];
        if (this.emojiList) {
            this.emojiList.innerHTML = '';
            emojis.forEach(emoji => {
                const span = document.createElement('span');
                span.textContent = emoji;
                span.className = 'emoji-item';
                span.addEventListener('click', () => this.insertEmoji(emoji));
                this.emojiList.appendChild(span);
            });
            console.log('Emojis populated.', emojis.length, 'items.');
        } else {
            console.error('Emoji list element not found.');
        }
    }

    toggleEmojiPicker(e) {
        console.log('Toggling emoji picker...');
        e.stopPropagation(); // Prevent document click from immediately closing
        if (this.emojiPicker) {
            this.emojiPicker.classList.toggle('hidden');
            console.log('Emoji picker visibility:', !this.emojiPicker.classList.contains('hidden'));
        } else {
            console.error('Emoji picker element not found.');
        }
    }

    insertEmoji(emoji) {
        console.log('Inserting emoji:', emoji);
        const input = this.messageInput;
        if (input) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = input.value.substring(0, start) + emoji + input.value.substring(end);
            input.focus();
            input.setSelectionRange(start + emoji.length, start + emoji.length);
            if (this.emojiPicker) {
                this.emojiPicker.classList.add('hidden'); // Close after selecting
            }
            console.log('Emoji inserted.');
        } else {
            console.error('Message input element not found.');
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        if (type === 'success') toast.querySelector('i').className = 'fas fa-check-circle';
        if (type === 'error') toast.querySelector('i').className = 'fas fa-times-circle';

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    handleTyping(data) {
        if (data.room === this.currentRoom && data.username !== window.auth.getCurrentUser()) {
            this.typingIndicator.textContent = `${data.username} is typing...`;
            this.typingIndicator.classList.remove('hidden');
        }
    }

    handleStopTyping(data) {
        if (data.room === this.currentRoom && data.username !== window.auth.getCurrentUser()) {
            this.typingIndicator.classList.add('hidden');
            this.typingIndicator.textContent = ''; // Clear text when hidden
        }
    }
}

// Initialize chat app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
}); 