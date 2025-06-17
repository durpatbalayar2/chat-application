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
├── render.yaml        # Render deployment config
├── Procfile          # Heroku deployment config
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

### Option 1: Deploy to Render.com (Recommended)
1. Create a free account on [Render.com](https://render.com)
2. Push your code to GitHub
3. In Render dashboard, click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Render will automatically detect the configuration from `render.yaml`
6. Click "Create Web Service"

### Option 2: Deploy to Railway.app
1. Create a free account on [Railway.app](https://railway.app)
2. Push your code to GitHub
3. In Railway dashboard, click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your repository
6. Railway will automatically deploy your application

### Option 3: Deploy to Heroku
1. Create a free account on [Heroku](https://heroku.com)
2. Install Heroku CLI
3. Login to Heroku:
   ```bash
   heroku login
   ```
4. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
5. Deploy your application:
   ```bash
   git push heroku main
   ```

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