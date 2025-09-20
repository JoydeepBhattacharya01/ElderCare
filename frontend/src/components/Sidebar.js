import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Pill, 
  CheckSquare, 
  Heart, 
  MessageCircle, 
  Video, 
  Music, 
  User,
  Calendar,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/medications', icon: Pill, label: 'Medications' },
    { path: '/tasks', icon: CheckSquare, label: 'Daily Tasks' },
    { path: '/health', icon: Heart, label: 'Health Monitor' },
    { path: '/chat', icon: MessageCircle, label: 'AI Companion' },
    { path: '/telemedicine', icon: Video, label: 'Call Doctor' },
    { path: '/entertainment', icon: Music, label: 'Entertainment' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white shadow-soft border-r border-gray-200 z-40">
      <div className="p-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-4 text-lg font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 shadow-soft'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Today's Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medications</span>
              <span className="text-sm font-medium text-success-600">2/3 taken</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasks</span>
              <span className="text-sm font-medium text-warning-600">1/4 completed</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Steps</span>
              <span className="text-sm font-medium text-primary-600">3,245</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-6 p-4 bg-danger-50 border border-danger-200 rounded-xl">
          <h3 className="text-lg font-semibold text-danger-800 mb-2">Emergency</h3>
          <p className="text-sm text-danger-700 mb-3">
            In case of emergency, contact your doctor or call 911
          </p>
          <button className="w-full bg-danger-600 hover:bg-danger-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            Emergency Call
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
