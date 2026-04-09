import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Info, Moon, Sun, Share } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-xl"
            >
            <Share className="h-6 w-6 text-white"/>
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Zendo
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" isActive={isActive('/')}>
                <Home className="h-4 w-4" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/about" isActive={isActive('/about')}>
                <Info className="h-4 w-4" />
                <span>About</span>
              </NavLink>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, isActive, children }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </motion.div>
  </Link>
);

export default Navbar;