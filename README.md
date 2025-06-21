# Collaborative Code Editor

A real-time collaborative code editor built with React, Node.js, and Socket.IO. Code together with your team in real-time with features like syntax highlighting, cursor tracking, and multi-user support.

## Features

- **Real-time Collaboration**: See changes instantly as your teammates code
- **Multi-language Support**: Syntax highlighting for 16+ programming languages
- **Cursor Tracking**: See where other users are typing in real-time
- **User Management**: Visual indicators for online users with unique colors
- **Room System**: Create and join collaborative coding sessions
- **Modern UI**: Beautiful dark theme with responsive design
- **Code Export**: Copy code to clipboard or download as files

## Supported Languages

- JavaScript, TypeScript
- Python, Java, C++, C#
- PHP, Ruby, Go, Rust
- HTML, CSS, SQL
- JSON, XML, Markdown

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **UUID** - Unique room generation

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **React Syntax Highlighter** - Code syntax highlighting
- **Lucide React** - Icon library

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collaborative-code-editor
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the development servers**
   ```bash
   # Start both server and client (recommended)
   npm run dev
   
   # Or start them separately:
   # Terminal 1 - Start server
   npm run server
   
   # Terminal 2 - Start client
   npm run client
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Usage

### Creating a Room
1. Enter your username on the home page
2. Click "Create New Room"
3. Share the room URL with your teammates

### Joining a Room
1. Enter your username
2. Click "Join Room" on an active room
3. Or use a direct room URL: `http://localhost:3000/room/{roomId}`

### Collaborative Features
- **Real-time Editing**: All changes are synchronized instantly
- **Cursor Tracking**: See other users' cursor positions
- **Language Switching**: Change syntax highlighting for the entire room
- **User List**: View all online users with unique color indicators

## Project Structure

```
collaborative-code-editor/
├── server/
│   └── index.js          # Express server with Socket.IO
├── client/
│   ├── public/
│   │   └── index.html    # Main HTML file
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js   # Landing page component
│   │   │   └── Editor.js # Main editor component
│   │   ├── App.js        # Main app component
│   │   └── index.js      # React entry point
│   └── package.json      # Client dependencies
├── package.json          # Server dependencies
└── README.md            # This file
```

## API Endpoints

### GET `/api/rooms`
Returns a list of active rooms with user counts.

### POST `/api/rooms`
Creates a new room and returns the room ID.

## Socket.IO Events

### Client to Server
- `join-room` - Join a collaborative room
- `code-change` - Send code updates
- `language-change` - Change programming language
- `cursor-update` - Update cursor position

### Server to Client
- `room-state` - Initial room state
- `code-updated` - Code changes from other users
- `language-updated` - Language changes from other users
- `user-joined` - New user joined the room
- `user-left` - User left the room
- `cursor-moved` - Cursor position updates from other users

## Development

### Available Scripts

```bash
# Development (runs both server and client)
npm run dev

# Server only
npm run server

# Client only
npm run client

# Build for production
npm run build

# Install all dependencies
npm run install-all
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
```

## Deployment

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY client/package*.json ./client/
RUN cd client && npm install

COPY . .
RUN cd client && npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) for code highlighting
- [Lucide React](https://lucide.dev/) for beautiful icons
- [VS Code](https://code.visualstudio.com/) for design inspiration #
