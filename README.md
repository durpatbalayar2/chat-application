# Real-Time Chat Application

A modern, real-time chat application built with HTML, CSS, and JavaScript using WebSocket technology.

## Features

- Real-time messaging using WebSocket
- User authentication with unique usernames
- Multiple chat rooms support
- Message formatting (bold, italics, links)
- Responsive design
- Message timestamps
- User presence indicators
- Room management (create/join)
- **Smart ChatBot** with 50+ auto-reply prompts
- **Auto prompt hints**: visible, clickable suggestions for users

## Project Structure

```
chat-application/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Styles
├── js/
│   ├── app.js         # Main application logic
│   └── auth.js        # Authentication handling
├── server.js          # WebSocket server
├── package.json       # Project dependencies
└── README.md          # This file
```

## Setup Instructions

1. Make sure you have Node.js installed on your system
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node server.js
   ```
5. Open `http://localhost:3000` in your web browser

## Deployment Instructions

### Deploy to Railway (Recommended)
1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Create a new project and link your GitHub repo
4. Railway will auto-detect and deploy your Node.js app
5. Share your Railway app URL with friends!

## ChatBot & Auto Prompt Hints

- The ChatBot responds to 50+ different prompts, including greetings, questions, jokes, facts, and more.
- Example prompts are always visible above the message input.
- **Click any prompt** to auto-fill the message input and try it instantly!
- The ChatBot will greet new users and suggest what to try.

### Example Prompts
- 👋 hi
- 😊 how are you
- 😂 joke
- 🤔 fact
- ❓ what is your name
- 🆘 help
- ⏰ what time is it
- 🎨 favorite color
- 🎵 do you like music
- 💡 who created you
- 📚 tell me a story
- ...and more!

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- WebSocket
- Node.js
- Express.js
- Socket.IO

## Security Features

- Username uniqueness validation
- Message sanitization
- Connection state management
- Error handling for disconnections

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest) 