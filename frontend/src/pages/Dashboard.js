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
  Target
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name}!
        </h1>
        <p className="text-lg opacity-90">
          Here's your health overview for today
        </p>
      </div>

      {/* Health Status Alert */}
      {dashboardData.healthRisk && (
        <div className={`card border-l-4 ${
          dashboardData.healthRisk.level === 'green' ? 'border-success-500' :
          dashboardData.healthRisk.level === 'yellow' ? 'border-warning-500' :
          'border-danger-500'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Medications */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Medication</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.medications.length > 0 ? '1' : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {dashboardData.medications.length > 0 
              ? `${dashboardData.medications[0].name} at ${new Date(dashboardData.medications[0].nextReminder).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
              : 'No upcoming medications'
            }
          </p>
        </div>

        {/* Tasks */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.tasks.filter(task => !task.isCompleted).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {dashboardData.tasks.filter(task => task.isCompleted).length} completed
          </p>
        </div>

        {/* Heart Rate */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Heart Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.vitals?.heartRate?.value || '--'}
              </p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-danger-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {dashboardData.vitals?.heartRate?.unit || 'bpm'}
          </p>
        </div>

        {/* Steps */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Steps Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.vitals?.steps?.value?.toLocaleString() || '--'}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Keep moving!
          </p>
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
  );
};

export default Dashboard;
