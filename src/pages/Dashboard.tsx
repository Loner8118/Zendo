import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  Download,
  Send,
  Trash2,
  Copy,
  Users,
  Clock,
  FileText,
  ArrowLeft,
  Paperclip,
  X,
  File
} from 'lucide-react';
import { roomApi } from '../api';
import { useToast } from '../hooks/useToast';
import { formatFileSize, getFileIcon, downloadFile } from '../utils/fileUtils';
import { Message, FileMessage, ChatMessage, SystemMessage } from '../types';

const Dashboard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const password = searchParams.get('password') || '';
  const { addToast } = useToast();

  // User state
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [participantCount, setParticipantCount] = useState<number>(0);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sending, setSending] = useState(false);

  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection and room joining
  useEffect(() => {
    if (!roomId || !password) {
      navigate('/join');
      return;
    }

    const initializeRoom = async () => {
      try {
        // Join room and get user info
        const joinResponse = await roomApi.joinRoom({
          roomId,
          password,
          userId: localStorage.getItem(`userId_${roomId}`) || undefined,
          userName: localStorage.getItem(`userName_${roomId}`) || undefined
        });

        setUserId(joinResponse.userId);
        setUserName(joinResponse.userName);
        setMessages(joinResponse.messages || []);
        
        // Store user info
        localStorage.setItem(`userId_${roomId}`, joinResponse.userId);
        localStorage.setItem(`userName_${roomId}`, joinResponse.userName);

        // Connect WebSocket
        connectWebSocket(joinResponse.userId);
      } catch (error) {
        console.error('Failed to join room:', error);
        addToast({
          type: 'error',
          title: 'Failed to Join Room',
          message: 'Please check your credentials and try again',
        });
        navigate('/join');
      }
    };

    initializeRoom();

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [roomId, password, navigate]);

  const connectWebSocket = (currentUserId: string) => {
    const wsUrl = (import.meta.env.VITE_WS_URL || 'http://localhost:3001').replace('http', 'ws');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      // Subscribe to room updates
      ws.send(JSON.stringify({ 
        type: 'subscribe', 
        roomId: roomId?.toUpperCase(),
        userId: currentUserId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        switch (data.type) {
          case 'chat_message':
            if (data.message) {
              setMessages(prev => [...prev, data.message]);
            }
            break;

          case 'file_message':
            if (data.message) {
              setMessages(prev => [...prev, data.message]);
              if (data.message.userId !== currentUserId) {
                addToast({
                  type: 'success',
                  title: 'New File Shared',
                  message: `${data.message.userName} shared ${data.message.fileName}`,
                });
              }
            }
            break;

          case 'user_joined':
            if (data.message) {
              setMessages(prev => [...prev, data.message]);
            }
            if (data.participantCount !== undefined) {
              setParticipantCount(data.participantCount);
            }
            break;

          case 'user_left':
            if (data.message) {
              setMessages(prev => [...prev, data.message]);
            }
            if (data.participantCount !== undefined) {
              setParticipantCount(data.participantCount);
            }
            break;

          case 'initial_messages':
            if (data.messages) {
              setMessages(data.messages);
            }
            if (data.participantCount !== undefined) {
              setParticipantCount(data.participantCount);
            }
            break;

          case 'user_typing':
            if (data.userId !== currentUserId) {
              setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (data.isTyping) {
                  newSet.add(data.userName || data.userId);
                } else {
                  newSet.delete(data.userName || data.userId);
                }
                return newSet;
              });
            }
            break;

          case 'room_closed':
            addToast({
              type: 'warning',
              title: 'Room Closed',
              message: 'This room has been closed',
            });
            navigate('/');
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    };
  };

  // Send typing indicator
  const sendTypingIndicator = (typing: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        roomId: roomId?.toUpperCase(),
        userId,
        userName,
        isTyping: typing
      }));
    }
  };

  // Handle message input change
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 1000);
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !roomId) return;

    try {
      await roomApi.sendMessage(roomId, {
        password,
        userId,
        userName,
        content: messageInput.trim()
      });

      setMessageInput('');
      setIsTyping(false);
      sendTypingIndicator(false);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Send message error:', error);
      addToast({
        type: 'error',
        title: 'Send Failed',
        message: 'Unable to send message. Please try again.',
      });
    }
  };

  // Handle file selection
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Send file
  const handleSendFile = async () => {
    if (!selectedFile || !roomId) return;

    setSending(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await roomApi.sendFile(roomId, {
            password,
            userId,
            userName,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            fileData: reader.result as string,
          });

          addToast({
            type: 'success',
            title: 'File Sent!',
            message: `${selectedFile.name} has been shared successfully`,
          });

          setSelectedFile(null);
        } catch (error) {
          throw error;
        }
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Send error:', error);
      addToast({
        type: 'error',
        title: 'Send Failed',
        message: 'Unable to send file. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  // Download file
  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const fileData = await roomApi.downloadFile(roomId!, fileId, password);
      downloadFile(fileName, fileData.fileData);

      addToast({
        type: 'success',
        title: 'Download Started!',
        message: `${fileName} is being downloaded`,
      });
    } catch (error) {
      console.error('Download error:', error);
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Unable to download file',
      });
    }
  };

  // Delete room
  const handleDeleteRoom = async () => {
    if (!roomId) return;

    if (!confirm('Are you sure you want to end this session? This will close the room for all users.')) {
      return;
    }

    try {
      await roomApi.deleteRoom(roomId, password);
      addToast({
        type: 'success',
        title: 'Room Ended',
        message: 'The file sharing session has been terminated',
      });
      navigate('/');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to End Session',
        message: 'Please try again',
      });
    }
  };

  // Copy room ID
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId || '');
      addToast({
        type: 'success',
        title: 'Room ID Copied!',
        message: 'Share this ID with others to invite them',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Unable to copy room ID',
      });
    }
  };

  // Render message based on type
  const renderMessage = (message: Message) => {
    const isOwnMessage = message.userId === userId;
    
    if (message.type === 'system') {
      return (
        <div className="text-center py-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      );
    }

    if (message.type === 'file') {
      const fileMsg = message as FileMessage;
      return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
            <div className={`rounded-2xl p-3 ${
              isOwnMessage
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-900 border border-gray-200'
            }`}>
              <div className="flex items-start space-x-2">
                <div className="text-2xl">{getFileIcon(fileMsg.fileName)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs opacity-70 mb-1">{message.userName}</p>
                  <p className="text-sm font-medium truncate">{fileMsg.fileName}</p>
                  <p className="text-xs opacity-70">{formatFileSize(fileMsg.fileSize)}</p>
                  <button
                    onClick={() => handleDownloadFile(fileMsg.fileId, fileMsg.fileName)}
                    className={`mt-2 text-xs px-3 py-1 rounded-lg flex items-center space-x-1 ${
                      isOwnMessage
                        ? 'bg-blue-500 hover:bg-blue-400'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      );
    }

    // Chat message
    const chatMsg = message as ChatMessage;
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          <div className={`rounded-2xl px-4 py-2 ${
            isOwnMessage 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}>
            {!isOwnMessage && (
              <p className="text-xs opacity-70 mb-1">{message.userName}</p>
            )}
            <p className="text-sm break-words">{chatMsg.content}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mb-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Leave Room</span>
              </Link>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Room Dashboard
                </h1>
                <div
                  className={`w-2 h-2 rounded-full ${
                    wsConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  title={wsConnected ? 'Connected' : 'Disconnected'}
                />
              </div>
              <div className="flex items-center space-x-4 mt-2 flex-wrap gap-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{participantCount} {participantCount === 1 ? 'user' : 'users'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Room:</span>
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono font-bold">
                    {roomId}
                  </code>
                  <button
                    onClick={copyRoomId}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteRoom}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="h-4 w-4" />
              <span>End Session</span>
            </motion.button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Chat Area - 2 columns on large screens */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-250px)]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start chatting!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {renderMessage(message)}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
                
                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                {selectedFile && (
                  <div className="mb-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <File className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSendFile}
                        disabled={sending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={messageInput}
                    onChange={handleMessageInputChange}
                    onKeyDown={(e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
}}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-xl transition-colors disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Activity Feed Sidebar - 1 column on large screens */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 h-[calc(100vh-250px)] flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Activity Feed
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {messages.filter(m => m.type === 'file' || m.type === 'system').length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No activity yet</p>
                    </div>
                  ) : (
                    messages
                      .filter(m => m.type === 'file' || m.type === 'system')
                      .map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`rounded-lg p-3 text-sm ${
                            message.type === 'file'
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {message.type === 'file' ? (
                            <div>
                              <div className="flex items-start space-x-2 mb-2">
                                <div className="text-lg">{getFileIcon((message as FileMessage).fileName)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    {message.userName}
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {(message as FileMessage).fileName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSize((message as FileMessage).fileSize)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownloadFile((message as FileMessage).fileId, (message as FileMessage).fileName)}
                                className="w-full text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center space-x-1 transition-colors"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </motion.div>
                      ))
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
              



