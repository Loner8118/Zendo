import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, Lock, Users, Heart, ArrowLeft, Github, Twitter } from 'lucide-react';

const About: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-5xl">🌐</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                About Zendo
              </h1>
              <div className="text-5xl">📂</div>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A modern, secure, and lightning-fast file sharing platform that puts privacy and simplicity first.
            </p>
          </motion.div>

          {/* Mission Statement */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center space-y-4">
              <div className="text-3xl">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To make file sharing simple, secure, and accessible to everyone. No sign-ups, no tracking, 
                no compromises on your privacy. Just pure, efficient file sharing that works.
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Why Choose Zendo?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Shield className="h-8 w-8" />}
                title="Privacy First"
                description="End-to-end encryption ensures your files remain private and secure during transfer."
                gradient="from-green-400 to-blue-500"
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8" />}
                title="Lightning Fast"
                description="Optimized peer-to-peer technology delivers files at maximum speed with minimal latency."
                gradient="from-yellow-400 to-orange-500"
              />
              <FeatureCard
                icon={<Globe className="h-8 w-8" />}
                title="Universal Access"
                description="Works seamlessly across all devices, browsers, and platforms without any installations."
                gradient="from-purple-400 to-pink-500"
              />
              <FeatureCard
                icon={<Lock className="h-8 w-8" />}
                title="Password Protected"
                description="Create secure rooms with custom passwords to control who can access your files."
                gradient="from-red-400 to-pink-500"
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="No Registration"
                description="Start sharing immediately without creating accounts or providing personal information."
                gradient="from-indigo-400 to-purple-500"
              />
              <FeatureCard
                icon={<Heart className="h-8 w-8" />}
                title="Open Source"
                description="Built with transparency in mind. Audit our code and contribute to making it better."
                gradient="from-pink-400 to-red-500"
              />
            </div>
          </motion.div>

          {/* Technical Details */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Create Room</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Generate a secure room with a unique ID and password
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Share Credentials</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Send room ID and password to recipients via QR code or text
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Transfer Files</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Drag, drop, and share files instantly with real-time notifications
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard number="100%" label="Secure" />
              <StatCard number="0" label="Sign-ups Required" />
              <StatCard number="∞" label="File Size Limit*" />
              <StatCard number="24/7" label="Available" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              *Subject to browser memory limitations
            </p>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Share?</h2>
            <p className="text-lg mb-6 opacity-90">
              "The smarter way to transfer files securely."
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-indigo-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-xl shadow-lg transition-colors"
                >
                  Create Room
                </motion.button>
              </Link>
              <Link to="/join">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-semibold py-3 px-8 rounded-xl transition-colors"
                >
                  Join Room
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            variants={itemVariants}
            className="text-center space-y-4 border-t border-gray-200 dark:border-gray-700 pt-8"
          >
            <div className="flex justify-center space-x-6">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://github.com"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Github className="h-6 w-6" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://twitter.com"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Twitter className="h-6 w-6" />
              </motion.a>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Zendo. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
  >
    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} text-white mb-4`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

interface StatCardProps {
  number: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, label }) => (
  <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{number}</div>
    <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
  </div>
);

export default About;