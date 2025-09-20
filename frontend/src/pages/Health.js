import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import HealthDashboard from '../components/HealthDashboard';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Footprints, 
  Weight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Calendar,
  BarChart3,
  LineChart
} from 'lucide-react';

const Health = () => {
  const [vitals, setVitals] = useState(null);
  const [healthRisk, setHealthRisk] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddLog, setShowAddLog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    vitals: {
      heartRate: { value: '', unit: 'bpm' },
      bloodPressure: { systolic: '', diastolic: '', unit: 'mmHg' },
      temperature: { value: '', unit: '°F' },
      steps: { value: '', unit: 'steps' },
      weight: { value: '', unit: 'lbs' }
    },
    mood: 'good',
    sleep: { hours: '', quality: 'good' },
    symptoms: [],
    notes: ''
  });

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh vitals every 10 seconds
    const interval = setInterval(fetchVitals, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const [vitalsRes, riskRes, logsRes] = await Promise.all([
        axios.get('/api/health/vitals'),
        axios.get('/api/health/risk-analysis'),
        axios.get('/api/health/logs?limit=10')
      ]);

      setVitals(vitalsRes.data);
      setHealthRisk(riskRes.data);
      setHealthLogs(logsRes.data.logs);
    } catch (error) {
      toast.error('Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVitals = async () => {
    try {
      const response = await axios.get('/api/health/vitals');
      setVitals(response.data);
    } catch (error) {
      console.error('Failed to fetch vitals:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 3) {
        // Handle nested objects like vitals.heartRate.value
        const [parent, child, grandchild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value
            }
          }
        }));
      } else {
        // Handle two-level nesting like sleep.hours
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one field is filled
    const hasVitals = Object.values(formData.vitals).some(vital => 
      vital.value && vital.value.toString().trim() !== ''
    );
    const hasSleep = formData.sleep.hours && formData.sleep.hours.toString().trim() !== '';
    const hasNotes = formData.notes && formData.notes.trim() !== '';
    const hasMood = formData.mood && formData.mood !== 'good';
    
    if (!hasVitals && !hasSleep && !hasNotes && !hasMood) {
      toast.error('Please fill in at least one health metric');
      return;
    }
    
    try {
      const response = await axios.post('/api/health/logs', formData);
      toast.success('Health log saved successfully');
      setShowAddLog(false);
      setFormData({
        vitals: {
          heartRate: { value: '', unit: 'bpm' },
          bloodPressure: { systolic: '', diastolic: '', unit: 'mmHg' },
          temperature: { value: '', unit: '°F' },
          steps: { value: '', unit: 'steps' },
          weight: { value: '', unit: 'lbs' }
        },
        mood: 'good',
        sleep: { hours: '', quality: 'good' },
        symptoms: [],
        notes: ''
      });
      fetchHealthData();
    } catch (error) {
      console.error('Health log save error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        toast.error(`Validation errors: ${error.response.data.errors.join(', ')}`);
      } else {
        toast.error('Failed to save health log. Please check your data and try again.');
      }
    }
  };

  const getHealthStatusColor = (level) => {
    switch (level) {
      case 'green': return 'text-success-600 bg-success-100 border-success-200';
      case 'yellow': return 'text-warning-600 bg-warning-100 border-warning-200';
      case 'red': return 'text-danger-600 bg-danger-100 border-danger-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const getVitalStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-success-600';
      case 'high': return 'text-danger-600';
      case 'low': return 'text-warning-600';
      default: return 'text-gray-600';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Monitor</h1>
          <p className="text-lg text-gray-600">Track your vital signs and health metrics</p>
        </div>
        <button
          onClick={() => setShowAddLog(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Health Log</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="card p-0">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 text-lg font-medium transition-colors duration-200 ${
              activeTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-5 h-5 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-4 text-lg font-medium transition-colors duration-200 ${
              activeTab === 'analytics'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <LineChart className="w-5 h-5 inline mr-2" />
            Analytics & Predictions
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'analytics' && <HealthDashboard />}
        </div>
      </div>
    </div>
  );

  function renderOverviewTab() {
    return (
      <div className="space-y-6">

        {/* Health Risk Alert */}
        {healthRisk && (
        <div className={`card border-l-4 ${
          healthRisk.level === 'green' ? 'border-success-500' :
          healthRisk.level === 'yellow' ? 'border-warning-500' :
          'border-danger-500'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl border ${getHealthStatusColor(healthRisk.level)}`}>
              {getHealthStatusIcon(healthRisk.level)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Health Risk Assessment: {healthRisk.level.toUpperCase()}
              </h3>
              <p className="text-lg text-gray-700 mb-3">{healthRisk.message}</p>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Risk Score</span>
                  <span className="text-sm font-bold text-gray-900">{healthRisk.score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      healthRisk.level === 'green' ? 'bg-success-500' :
                      healthRisk.level === 'yellow' ? 'bg-warning-500' :
                      'bg-danger-500'
                    }`}
                    style={{ width: `${(healthRisk.score / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              {healthRisk.recommendations && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {healthRisk.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Current Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Heart Rate */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Heart Rate</h3>
                <p className="text-sm text-gray-600">Beats per minute</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${getVitalStatusColor(vitals?.heartRate?.status)}`}>
              {vitals?.heartRate?.status || 'normal'}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {vitals?.heartRate?.value || '--'}
          </div>
          <p className="text-sm text-gray-500">{vitals?.heartRate?.unit || 'bpm'}</p>
        </div>

        {/* Blood Pressure */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Blood Pressure</h3>
                <p className="text-sm text-gray-600">Systolic/Diastolic</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${getVitalStatusColor(vitals?.bloodPressure?.status)}`}>
              {vitals?.bloodPressure?.status || 'normal'}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {vitals?.bloodPressure?.systolic || '--'}/{vitals?.bloodPressure?.diastolic || '--'}
          </div>
          <p className="text-sm text-gray-500">{vitals?.bloodPressure?.unit || 'mmHg'}</p>
        </div>

        {/* Temperature */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Temperature</h3>
                <p className="text-sm text-gray-600">Body temperature</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${getVitalStatusColor(vitals?.temperature?.status)}`}>
              {vitals?.temperature?.status || 'normal'}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {vitals?.temperature?.value || '--'}
          </div>
          <p className="text-sm text-gray-500">{vitals?.temperature?.unit || '°F'}</p>
        </div>

        {/* Steps */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <Footprints className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
                <p className="text-sm text-gray-600">Today's activity</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${getVitalStatusColor(vitals?.steps?.status)}`}>
              {vitals?.steps?.status || 'normal'}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {vitals?.steps?.value?.toLocaleString() || '--'}
          </div>
          <p className="text-sm text-gray-500">{vitals?.steps?.unit || 'steps'}</p>
        </div>

        {/* Weight */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Weight className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Weight</h3>
                <p className="text-sm text-gray-600">Current weight</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${getVitalStatusColor(vitals?.weight?.status)}`}>
              {vitals?.weight?.status || 'normal'}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {vitals?.weight?.value || '--'}
          </div>
          <p className="text-sm text-gray-500">{vitals?.weight?.unit || 'lbs'}</p>
        </div>

        {/* Health Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Health Trend</h3>
                <p className="text-sm text-gray-600">7-day average</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-success-600 mb-2">
            Improving
          </div>
          <p className="text-sm text-gray-500">Keep up the good work!</p>
        </div>
      </div>

      {/* Add Health Log Form */}
      {showAddLog && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Health Log</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  name="vitals.heartRate.value"
                  value={formData.vitals.heartRate.value}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="72"
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Systolic BP
                </label>
                <input
                  type="number"
                  name="vitals.bloodPressure.systolic"
                  value={formData.vitals.bloodPressure.systolic}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="120"
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Diastolic BP
                </label>
                <input
                  type="number"
                  name="vitals.bloodPressure.diastolic"
                  value={formData.vitals.bloodPressure.diastolic}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="80"
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="vitals.temperature.value"
                  value={formData.vitals.temperature.value}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="98.6"
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Steps
                </label>
                <input
                  type="number"
                  name="vitals.steps.value"
                  value={formData.vitals.steps.value}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="5000"
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="vitals.weight.value"
                  value={formData.vitals.weight.value}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="150"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Mood
                </label>
                <select
                  name="mood"
                  value={formData.mood}
                  onChange={handleInputChange}
                  className="input-primary"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="okay">Okay</option>
                  <option value="poor">Poor</option>
                  <option value="terrible">Terrible</option>
                </select>
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Sleep Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="sleep.hours"
                  value={formData.sleep.hours}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="8"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input-primary"
                rows="3"
                placeholder="Any additional health notes..."
              />
            </div>

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                Save Health Log
              </button>
              <button
                type="button"
                onClick={() => setShowAddLog(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Health Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Health Logs</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        {healthLogs.length > 0 ? (
          <div className="space-y-4">
            {healthLogs.map((log, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.date).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {log.vitals.heartRate?.value && (
                    <div>
                      <span className="text-gray-600">Heart Rate:</span>
                      <span className="ml-1 font-medium">{log.vitals.heartRate.value} bpm</span>
                    </div>
                  )}
                  {log.vitals.bloodPressure?.systolic && (
                    <div>
                      <span className="text-gray-600">BP:</span>
                      <span className="ml-1 font-medium">
                        {log.vitals.bloodPressure.systolic}/{log.vitals.bloodPressure.diastolic}
                      </span>
                    </div>
                  )}
                  {log.vitals.temperature?.value && (
                    <div>
                      <span className="text-gray-600">Temp:</span>
                      <span className="ml-1 font-medium">{log.vitals.temperature.value}°F</span>
                    </div>
                  )}
                  {log.mood && (
                    <div>
                      <span className="text-gray-600">Mood:</span>
                      <span className="ml-1 font-medium capitalize">{log.mood}</span>
                    </div>
                  )}
                </div>
                
                {log.notes && (
                  <p className="text-sm text-gray-600 mt-2">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No health logs yet</p>
          </div>
        )}
      </div>
      </div>
    );
  }
};

export default Health;
