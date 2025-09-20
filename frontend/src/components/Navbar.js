import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, User, LogOut, Heart, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ElderCare</h1>
              <p className="text-sm text-gray-500">Your Health Companion</p>
            </div>
          </div>
        </div>

        {/* User Info and Actions */}
        <div className="flex items-center space-x-6">
          {/* Health Status Indicator */}
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-success-600" />
            <span className="text-sm font-medium text-gray-700">Good Health</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors duration-200">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-danger-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                Hello, {user?.name || 'User'}!
              </p>
              <p className="text-sm text-gray-500">
                Age {user?.age || 'N/A'} • {user?.healthCondition || 'Good Health'}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
