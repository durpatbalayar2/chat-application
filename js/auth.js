class Auth {
    constructor() {
        this.currentUser = null;
        this.loginForm = document.getElementById('loginForm');
        this.loginModal = document.getElementById('loginModal');
        this.chatInterface = document.getElementById('chatInterface');
        this.currentUserSpan = document.getElementById('currentUser');
        this.logoutBtn = document.getElementById('logoutBtn');

        // Use io() with only options for cross-environment compatibility
        this.socket = io({
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Add connection status logging
        this.socket.on('connect', () => {
            console.log('Connected to server successfully');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
        });

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        
        if (username) {
            console.log('Attempting login with username:', username);
            // Emit join event to server (not login)
            this.socket.emit('join', username, (response) => {
                console.log('Login response:', response);
                if (response && response.success) {
                    this.currentUser = username;
                    this.currentUserSpan.textContent = username;
                    this.loginModal.classList.add('hidden');
                    this.chatInterface.classList.remove('hidden');
                    this.loginForm.reset();
                } else {
                    alert(response ? response.message : 'Login failed. Please try again.');
                }
            });
        }
    }

    handleLogout() {
        this.socket.emit('logout');
        this.currentUser = null;
        this.chatInterface.classList.add('hidden');
        this.loginModal.classList.remove('hidden');
        document.getElementById('messageArea').innerHTML = '';
        document.getElementById('roomList').innerHTML = '';
        document.getElementById('userList').innerHTML = '';
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
}); 