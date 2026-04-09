import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Home />
              </motion.div>
            }
          />
          <Route
            path="/create"
            element={
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CreateRoom />
              </motion.div>
            }
          />
          <Route
            path="/join"
            element={
              <motion.div
                key="join"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <JoinRoom />
              </motion.div>
            }
          />
          <Route
            path="/dashboard/:roomId"
            element={
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard />
              </motion.div>
            }
          />
          <Route
            path="/about"
            element={
              <motion.div
                key="about"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <About />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;