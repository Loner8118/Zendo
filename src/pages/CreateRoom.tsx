import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Copy, Timer, QrCode, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { roomApi } from '../api';
import { useToast } from '../hooks/useToast';

const CreateRoom: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState<{ roomId: string; password: string; expiresAt: string } | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { addToast } = useToast();

  const handleCreateRoom = async () => {
    if (!password.trim()) {
      addToast({
        type: 'error',
        title: 'Password Required',
        message: 'Please enter a password for your room',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await roomApi.createRoom({ password: password.trim() });
      setRoomData(response);
      
      // Generate QR code
      const roomUrl = `${window.location.origin}/join?roomId=${response.roomId}`;
      const qrUrl = await QRCode.toDataURL(roomUrl);
      setQrCodeUrl(qrUrl);

      // Start countdown timer
      const expiryTime = new Date(response.expiresAt).getTime();
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.floor((expiryTime - now) / 1000)));

      addToast({
        type: 'success',
        title: 'Room Created Successfully!',
        message: 'Your secure file sharing room is ready',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Create Room',
        message: 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({
        type: 'success',
        title: `${type} Copied!`,
        message: `${type} has been copied to your clipboard`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Unable to copy to clipboard',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  if (roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Room Created Successfully!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Share these credentials with others to join your room
                </p>
              </div>

              <div className="space-y-6">
                {/* Room ID */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room ID
                  </label>
                  <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <span className="font-mono text-lg text-gray-900 dark:text-white font-bold">
                      {roomData.roomId}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(roomData.roomId, 'Room ID')}
                      className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Password */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <span className="font-mono text-lg text-gray-900 dark:text-white">
                      {roomData.password}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(roomData.password, 'Password')}
                      className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Timer */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Timer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Room expires in
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <QrCode className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        QR Code for Quick Join
                      </span>
                    </div>
                    <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                      <img src={qrCodeUrl} alt="Room QR Code" className="w-32 h-32" />
                    </div>
                  </div>
                )}

                {/* Dashboard Link */}
                <Link to={`/dashboard/${roomData.roomId}?password=${roomData.password}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Go to Dashboard
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create New Room
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Set a password to secure your file sharing room
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a secure password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Choose a strong password that others can't easily guess
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Room...</span>
                  </div>
                ) : (
                  'Create Room'
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRoom;