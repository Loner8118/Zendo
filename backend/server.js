require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const WebSocket = require('ws');
const http = require('http');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

console.log("Allowed Origins:", allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // allow localhost
    if (origin.includes("localhost")) {
      return callback(null, true);
    }

    // allow production frontend
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(null, false); // ❗ IMPORTANT change
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

//app.options("*", cors()); //  handle preflight


app.use(express.json({ limit: '100mb' }));

// In-memory storage
const rooms = new Map();
const roomConnections = new Map();

// Room expiry time (1 hour)
const ROOM_EXPIRY_TIME = 60 * 60 * 1000;

// Helper function to generate room ID
function generateRoomId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Helper function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Clean up expired rooms
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    if (now > room.expiresAt) {
      rooms.delete(roomId);
      roomConnections.delete(roomId);
      console.log(`Room ${roomId} expired and deleted`);
    }
  }
}, 60000);

// API Routes

// Create Room
app.post('/api/rooms/create', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.trim().length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const roomId = generateRoomId();
    const passwordHash = hashPassword(password.trim());
    const expiresAt = Date.now() + ROOM_EXPIRY_TIME;

    const room = {
      roomId,
      passwordHash,
      password: password.trim(),
      createdAt: Date.now(),
      expiresAt,
      messages: [], // Combined chat + file + system messages
      files: [],
      participants: new Map(), // Track users with their IDs
      participantCount: 0
    };

    rooms.set(roomId, room);

    res.json({
      roomId,
      password: password.trim(),
      expiresAt: new Date(expiresAt).toISOString()
    });

    console.log(`Room created: ${roomId}`);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join Room
app.post('/api/rooms/join', (req, res) => {
  try {
    const { roomId, password, userId, userName } = req.body;

    if (!roomId || !password) {
      return res.status(400).json({ error: 'Room ID and password are required' });
    }

    const room = rooms.get(roomId.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (Date.now() > room.expiresAt) {
      rooms.delete(roomId);
      return res.status(410).json({ error: 'Room has expired' });
    }

    const passwordHash = hashPassword(password.trim());
    if (passwordHash !== room.passwordHash) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Add user to participants
    const userIdentifier = userId || crypto.randomBytes(8).toString('hex');
    const userDisplayName = userName || `User-${userIdentifier.substring(0, 6)}`;
    
    room.participants.set(userIdentifier, {
      id: userIdentifier,
      name: userDisplayName,
      joinedAt: Date.now()
    });

    // Add join message (system message)
    const joinMessage = {
      id: crypto.randomBytes(8).toString('hex'),
      type: 'system',
      content: `${userDisplayName} joined the room`,
      timestamp: new Date().toISOString(),
      userId: userIdentifier
    };
    room.messages.push(joinMessage);

    room.participantCount = room.participants.size;

    // Broadcast to WebSocket clients
    broadcastToRoom(roomId, {
      type: 'user_joined',
      message: joinMessage,
      participantCount: room.participantCount
    });

    res.json({
      success: true,
      roomId: room.roomId,
      userId: userIdentifier,
      userName: userDisplayName,
      expiresAt: new Date(room.expiresAt).toISOString(),
      messages: room.messages
    });

    console.log(`User ${userDisplayName} joined room: ${roomId}`);
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Send Chat Message
app.post('/api/rooms/:roomId/message', (req, res) => {
  try {
    const { roomId } = req.params;
    const { password, userId, userName, content } = req.body;

    const room = rooms.get(roomId.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const passwordHash = hashPassword(password);
    if (passwordHash !== room.passwordHash) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Create chat message
    const chatMessage = {
      id: crypto.randomBytes(8).toString('hex'),
      type: 'chat',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      userId,
      userName: userName || 'Anonymous'
    };

    room.messages.push(chatMessage);

    // Broadcast to WebSocket clients
    broadcastToRoom(roomId, {
      type: 'chat_message',
      message: chatMessage
    });

    res.json({ success: true, message: chatMessage });
    console.log(`Chat message in room ${roomId} from ${userName}: ${content.substring(0, 50)}`);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Send File (File Offer)
app.post('/api/rooms/:roomId/file', (req, res) => {
  try {
    const { roomId } = req.params;
    const { password, userId, userName, fileName, fileSize, fileType, fileData } = req.body;

    console.log('Receiving file for room:', roomId);
    console.log('File name:', fileName);
    console.log('File size:', fileSize);

    const room = rooms.get(roomId.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const passwordHash = hashPassword(password);
    if (passwordHash !== room.passwordHash) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (!fileData || fileData.length === 0) {
      console.error('No file data received!');
      return res.status(400).json({ error: 'No file data provided' });
    }

    // Ensure files array exists
    if (!room.files) room.files = [];

    // Generate file ID
    const fileId = crypto.randomBytes(8).toString('hex');

    // Store file with data
    room.files.push({
      id: fileId,
      fileName,
      fileSize,
      fileType,
      fileData,
      timestamp: new Date().toISOString(),
      uploadedBy: userId
    });

    // Add file message to messages array
    const fileMessage = {
      id: crypto.randomBytes(8).toString('hex'),
      type: 'file',
      content: `Shared a file`,
      timestamp: new Date().toISOString(),
      userId,
      userName: userName || 'Anonymous',
      fileId,
      fileName,
      fileSize,
      fileType
    };

    room.messages.push(fileMessage);

    // Broadcast to WebSocket clients
    broadcastToRoom(roomId, {
      type: 'file_message',
      message: fileMessage
    });

    res.json({ success: true, fileId, message: fileMessage });
    console.log(`File shared in room ${roomId}: ${fileName} (${fileSize} bytes)`);
  } catch (error) {
    console.error('Error sending file:', error);
    res.status(500).json({ error: 'Failed to send file' });
  }
});

// Get Messages (for initial load or polling fallback)
app.get('/api/rooms/:roomId/messages', (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.query;

    const room = rooms.get(roomId.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const passwordHash = hashPassword(password);
    if (passwordHash !== room.passwordHash) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({
      messages: room.messages,
      participantCount: room.participantCount
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Download file from activity feed
app.get('/api/rooms/:roomId/file/:fileId', (req, res) => {
  try {
    const { roomId, fileId } = req.params;
    const { password } = req.query;

    const room = rooms.get(roomId.toUpperCase());
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (hashPassword(password) !== room.passwordHash)
      return res.status(401).json({ error: 'Invalid password' });

    const file = room.files.find(f => f.id === fileId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    // Send file data
    res.json({
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      fileData: file.fileData
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Delete Room
app.delete('/api/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.query;

    const room = rooms.get(roomId.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const passwordHash = hashPassword(password);
    if (passwordHash !== room.passwordHash) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    rooms.delete(roomId.toUpperCase());
    
    // Broadcast room closed
    broadcastToRoom(roomId, { type: 'room_closed' });
    roomConnections.delete(roomId.toUpperCase());

    res.json({ success: true });
    console.log(`Room deleted: ${roomId}`);
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// WebSocket handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'subscribe' && data.roomId) {
        const roomId = data.roomId.toUpperCase();
        
        if (!roomConnections.has(roomId)) {
          roomConnections.set(roomId, new Set());
        }
        roomConnections.get(roomId).add(ws);
        
        ws.roomId = roomId;
        ws.userId = data.userId;
        console.log(`Client subscribed to room: ${roomId}`);
        
        // Send current messages
        const room = rooms.get(roomId);
        if (room) {
          ws.send(JSON.stringify({
            type: 'initial_messages',
            messages: room.messages,
            participantCount: room.participantCount
          }));
        }
      }

      // Handle typing indicator
      if (data.type === 'typing') {
        const roomId = data.roomId.toUpperCase();
        broadcastToRoom(roomId, {
          type: 'user_typing',
          userId: data.userId,
          userName: data.userName,
          isTyping: data.isTyping
        }, ws); // Exclude sender
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    if (ws.roomId) {
      const connections = roomConnections.get(ws.roomId);
      if (connections) {
        connections.delete(ws);
        console.log(`Client unsubscribed from room: ${ws.roomId}`);
        
        // Optionally notify others that user left
        const room = rooms.get(ws.roomId);
        if (room && ws.userId) {
          const participant = room.participants.get(ws.userId);
          if (participant) {
            room.participants.delete(ws.userId);
            room.participantCount = room.participants.size;
            
            const leaveMessage = {
              id: crypto.randomBytes(8).toString('hex'),
              type: 'system',
              content: `${participant.name} left the room`,
              timestamp: new Date().toISOString()
            };
            room.messages.push(leaveMessage);
            
            broadcastToRoom(ws.roomId, {
              type: 'user_left',
              message: leaveMessage,
              participantCount: room.participantCount
            });
          }
        }
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastToRoom(roomId, message, excludeWs = null) {
  const connections = roomConnections.get(roomId.toUpperCase());
  if (connections) {
    const messageStr = JSON.stringify(message);
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
        client.send(messageStr);
      }
    });
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});