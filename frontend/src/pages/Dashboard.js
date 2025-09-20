import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Heart, 
  Pill, 
  CheckSquare, 
  Activity, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Sparkles,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    medications: [],
    tasks: [],
    healthRisk: null,
    vitals: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [medicationsRes, tasksRes, healthRes, vitalsRes] = await Promise.all([
        axios.get('/api/medications/reminders/upcoming'),
        axios.get('/api/tasks/today'),
        axios.get('/api/health/risk-analysis'),
        axios.get('/api/health/vitals')
      ]);

      setDashboardData({
        medications: medicationsRes.data,
        tasks: tasksRes.data,
        healthRisk: healthRes.data,
        vitals: vitalsRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (level) => {
    switch (level) {
      case 'green': return 'text-success-600 bg-success-100';
      case 'yellow': return 'text-warning-600 bg-warning-100';
      case 'red': return 'text-danger-600 bg-danger-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusIcon = (level) => {
    switch (level) {
      case 'green': return <CheckCircle className="w-5 h-5" />;
      case 'yellow': return <AlertTriangle className="w-5 h-5" />;
      case 'red': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (hour < 18) return <Sun className="w-8 h-8 text-orange-500" />;
    return <Moon className="w-8 h-8 text-indigo-400" />;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xl text-gray-600 font-medium">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container-padding py-8 space-y-8">
        <div className="card-gradient animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {getGreetingIcon()}
                <div>
                  <h1 className="text-4xl font-bold gradient-text">
                    {getGreeting()}, {user?.name}! ✨
                  </h1>
                  <p className="text-xl text-gray-600 mt-2">
                    Here's your personalized health overview for today
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2 shadow-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-gentle"></div>
                  <span className="text-sm font-medium text-gray-700">System Status: Healthy</span>
                </div>
                <div className="bg-white/60 rounded-full px-4 py-2 shadow-sm">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Status Alert */}
        {dashboardData.healthRisk && (
          <div className={`card-gradient border-l-4 animate-slide-up ${
            dashboardData.healthRisk.level === 'green' ? 'border-green-500' :
            dashboardData.healthRisk.level === 'yellow' ? 'border-amber-500' :
            'border-red-500'
          }`}>
          <div className="flex items-start space-x-4">
            <div className={`p-2 rounded-lg ${getHealthStatusColor(dashboardData.healthRisk.level)}`}>
              {getHealthStatusIcon(dashboardData.healthRisk.level)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Health Status: {dashboardData.healthRisk.level.toUpperCase()}
              </h3>
              <p className="text-gray-600 mb-2">{dashboardData.healthRisk.message}</p>
              {dashboardData.healthRisk.recommendations && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {dashboardData.healthRisk.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {/* Medications */}
          <div className="card-hover group">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-600">Next Medication</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {dashboardData.medications.length > 0 ? '1' : '0'}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Pill className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3">
              <p className="text-blue-700 font-medium text-sm">
                {dashboardData.medications.length > 0 
                  ? `${dashboardData.medications[0].name} at ${new Date(dashboardData.medications[0].nextReminder).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                  : 'No upcoming medications 💊'
                }
              </p>
            </div>
          </div>

          {/* Tasks */}
          <div className="card-hover group">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-600">Today's Tasks</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {dashboardData.tasks.filter(task => !task.isCompleted).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckSquare className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl p-3">
              <p className="text-green-700 font-medium text-sm">
                {dashboardData.tasks.filter(task => task.isCompleted).length} completed today! 🎯
              </p>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="card-hover group">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-600">Heart Rate</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {dashboardData.vitals?.heartRate?.value || '--'}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-red-50 rounded-2xl p-3">
              <p className="text-red-700 font-medium text-sm">
                {dashboardData.vitals?.heartRate?.unit || 'bpm'} - Looking good! ❤️
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="card-hover group">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-600">Steps Today</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {dashboardData.vitals?.steps?.value?.toLocaleString() || '--'}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3">
              <p className="text-purple-700 font-medium text-sm">
                Keep moving! 🚶‍♂️ Great progress!
              </p>
            </div>
          </div>
        </div>

      {/* Upcoming Medications */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Medications</h2>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        
        {dashboardData.medications.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.medications.slice(0, 3).map((medication, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{medication.name}</p>
                    <p className="text-sm text-gray-600">{medication.dosage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(medication.nextReminder).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <p className="text-xs text-gray-500">Next dose</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming medications</p>
          </div>
        )}
      </div>

      {/* Today's Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        
        {dashboardData.tasks.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.tasks.slice(0, 4).map((task, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-xl ${
                task.isCompleted ? 'bg-success-50 border border-success-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    task.isCompleted ? 'bg-success-600' : 'bg-gray-300'
                  }`}>
                    {task.isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      task.isCompleted ? 'text-success-800 line-through' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{task.category}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  task.priority === 'high' ? 'bg-danger-100 text-danger-800' :
                  task.priority === 'medium' ? 'bg-warning-100 text-warning-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks for today</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
