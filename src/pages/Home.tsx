import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, LogIn, Zap, Shield, Globe } from 'lucide-react';

const Home: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-12"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                🌐
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 bg-clip-text text-transparent">
                Zendo
              </h1>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                📂
              </motion.div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Share files instantly and securely across any device. No registration required, 
              just create a room and start sharing.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-md mx-auto"
          >
            <Link to="/create" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <Plus className="h-5 w-5" />
                <span>Create Room</span>
              </motion.button>
            </Link>

            <Link to="/join" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <LogIn className="h-5 w-5" />
                <span>Join Room</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
              Why Choose Zendo?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="h-8 w-8" />}
                title="Lightning Fast"
                description="Share files instantly with our optimized peer-to-peer technology"
                gradient="from-yellow-400 to-orange-500"
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8" />}
                title="Secure & Private"
                description="End-to-end encryption ensures your files stay private and secure"
                gradient="from-green-400 to-blue-500"
              />
              <FeatureCard
                icon={<Globe className="h-8 w-8" />}
                title="Cross-Platform"
                description="Works seamlessly across all devices and operating systems"
                gradient="from-purple-400 to-pink-500"
              />
            </div>
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
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
  >
    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} text-white mb-4`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
  </motion.div>

  
);


export default Home;