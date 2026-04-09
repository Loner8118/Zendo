import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Key, Hash, ArrowLeft, User } from 'lucide-react';
import { roomApi } from '../api';
import { useToast } from '../hooks/useToast';

const JoinRoom: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    // Auto-fill room ID from URL params (from QR code or direct link)
    const roomIdParam = searchParams.get('roomId');
    if (roomIdParam) {
      setRoomId(roomIdParam);
    }

    // Load saved username if exists
    const savedUserName = localStorage.getItem('quickshare_username');
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, [searchParams]);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      addToast({
        type: 'error',
        title: 'Room ID Required',
        message: 'Please enter a valid room ID',
      });
      return;
    }

    if (!password.trim()) {
      addToast({
        type: 'error',
        title: 'Password Required',
        message: 'Please enter the room password',
      });
      return;
    }

    if (!userName.trim()) {
      addToast({
        type: 'error',
        title: 'Name Required',
        message: 'Please enter your name',
      });
      return;
    }

    setLoading(true);
    try {
      // Save username for future use
      localStorage.setItem('quickshare_username', userName.trim());

      addToast({
        type: 'success',
        title: 'Joining Room...',
        message: 'Please wait while we connect you',
      });

      // Navigate to dashboard - the actual joining happens there
      navigate(`/dashboard/${roomId.trim().toUpperCase()}?password=${encodeURIComponent(password.trim())}`);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Join Room',
        message: 'Invalid room ID or password. Please check and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🚪</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Join Room
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Enter the room details to start sharing files
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This name will be visible to other users in the room
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="Enter room ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 font-mono"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter room password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Joining Room...</span>
                  </div>
                ) : (
                  'Join Room'
                )}
              </motion.button>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Don't have a room yet?{' '}
                  <Link
                    to="/create"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinRoom;