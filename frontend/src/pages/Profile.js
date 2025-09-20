import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  Phone, 
  MapPin,
  Settings,
  Save,
  Edit,
  Eye,
  EyeOff,
  Bell,
  Palette,
  Type
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    healthCondition: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    preferences: {
      theme: 'light',
      fontSize: 'large',
      notifications: {
        medication: true,
        tasks: true,
        health: true
      }
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        healthCondition: user.healthCondition || '',
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          phone: user.emergencyContact?.phone || '',
          relationship: user.emergencyContact?.relationship || ''
        },
        preferences: {
          theme: user.preferences?.theme || 'light',
          fontSize: user.preferences?.fontSize || 'large',
          notifications: {
            medication: user.preferences?.notifications?.medication ?? true,
            tasks: user.preferences?.notifications?.tasks ?? true,
            health: user.preferences?.notifications?.health ?? true
          }
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const getFontSizeClass = (size) => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-lg';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-lg text-gray-600">Manage your personal information and preferences</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-primary flex items-center space-x-2"
        >
          {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-primary pl-10"
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-primary pl-10"
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="input-primary pl-10"
                      disabled={!isEditing}
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Health Condition
                  </label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="healthCondition"
                      value={formData.healthCondition}
                      onChange={handleInputChange}
                      className="input-primary pl-10"
                      disabled={!isEditing}
                      required
                    >
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Hypertension">Hypertension</option>
                      <option value="Heart Condition">Heart Condition</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Emergency Contact */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Emergency Contact</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    className="input-primary pl-10"
                    disabled={!isEditing}
                    placeholder="Enter contact name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      className="input-primary pl-10"
                      disabled={!isEditing}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                      className="input-primary pl-10"
                      disabled={!isEditing}
                      placeholder="e.g., Son, Daughter, Spouse"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences & Settings */}
        <div className="space-y-6">
          {/* Preferences */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="relative">
                  <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="preferences.theme"
                    value={formData.preferences.theme}
                    onChange={handleInputChange}
                    className="input-primary pl-10"
                    disabled={!isEditing}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="high-contrast">High Contrast</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="preferences.fontSize"
                    value={formData.preferences.fontSize}
                    onChange={handleInputChange}
                    className="input-primary pl-10"
                    disabled={!isEditing}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Medication Reminders</p>
                    <p className="text-sm text-gray-600">Get notified about medication times</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferences.notifications.medication"
                    checked={formData.preferences.notifications.medication}
                    onChange={handleInputChange}
                    className="sr-only peer"
                    disabled={!isEditing}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Task Reminders</p>
                    <p className="text-sm text-gray-600">Get notified about daily tasks</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferences.notifications.tasks"
                    checked={formData.preferences.notifications.tasks}
                    onChange={handleInputChange}
                    className="sr-only peer"
                    disabled={!isEditing}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Health Alerts</p>
                    <p className="text-sm text-gray-600">Get notified about health updates</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferences.notifications.health"
                    checked={formData.preferences.notifications.health}
                    onChange={handleInputChange}
                    className="sr-only peer"
                    disabled={!isEditing}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h2>
            
            <div className="space-y-4">
              <button className="w-full btn-secondary text-left">
                <Settings className="w-5 h-5 mr-2" />
                Change Password
              </button>
              <button className="w-full btn-secondary text-left">
                <Mail className="w-5 h-5 mr-2" />
                Export Data
              </button>
              <button className="w-full btn-danger text-left">
                <User className="w-5 h-5 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsEditing(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
