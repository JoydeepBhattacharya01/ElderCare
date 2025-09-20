import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Target
} from 'lucide-react';

const HealthDashboard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedMetric, setSelectedMetric] = useState('heartRate');

  useEffect(() => {
    fetchHealthTrends();
  }, [selectedPeriod]);

  const fetchHealthTrends = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/health/trends?days=${selectedPeriod}`);
      setHealthData(response.data);
    } catch (error) {
      toast.error('Failed to load health trends');
      console.error('Health trends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (metric) => {
    const colors = {
      heartRate: '#ef4444',
      systolic: '#3b82f6',
      diastolic: '#06b6d4',
      steps: '#10b981',
      weight: '#8b5cf6',
      riskScore: '#f59e0b',
      mood: '#ec4899',
      sleepHours: '#6366f1'
    };
    return colors[metric] || '#6b7280';
  };

  const getMetricName = (metric) => {
    const names = {
      heartRate: 'Heart Rate',
      systolic: 'Systolic BP',
      diastolic: 'Diastolic BP',
      steps: 'Daily Steps',
      weight: 'Weight',
      riskScore: 'Risk Score',
      mood: 'Mood Score',
      sleepHours: 'Sleep Hours'
    };
    return names[metric] || metric;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!healthData || healthData.trends.length === 0) {
    return (
      <div className="card text-center py-12">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Data Available</h3>
        <p className="text-gray-600 mb-6">
          Start logging your health metrics to see trends and predictions.
        </p>
        <button 
          onClick={() => window.location.href = '/health'}
          className="btn-primary"
        >
          Add Health Log
        </button>
      </div>
    );
  }

  const chartData = healthData.trends.map(trend => ({
    ...trend,
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Analytics Dashboard</h2>
          <p className="text-gray-600">Predictive analysis of your health trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="input-primary"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">{selectedPeriod} days</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {healthData.trends.filter(t => t.heartRate).length}
          </div>
          <p className="text-sm text-gray-600">Heart Rate Logs</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Average</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(healthData.trends.filter(t => t.steps).reduce((acc, t) => acc + t.steps, 0) / healthData.trends.filter(t => t.steps).length) || 0}
          </div>
          <p className="text-sm text-gray-600">Daily Steps</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Current</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {healthData.trends[healthData.trends.length - 1]?.riskScore || 0}
          </div>
          <p className="text-sm text-gray-600">Risk Score</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Predictions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {healthData.predictions.length}
          </div>
          <p className="text-sm text-gray-600">Available</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Health Trends</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="input-primary"
          >
            <option value="heartRate">Heart Rate</option>
            <option value="systolic">Systolic BP</option>
            <option value="diastolic">Diastolic BP</option>
            <option value="steps">Daily Steps</option>
            <option value="weight">Weight</option>
            <option value="riskScore">Risk Score</option>
            <option value="mood">Mood Score</option>
            <option value="sleepHours">Sleep Hours</option>
          </select>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              strokeWidth={2}
              dot={{ fill: getMetricColor(selectedMetric), strokeWidth: 2, r: 4 }}
              name={getMetricName(selectedMetric)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Predictions */}
      {healthData.predictions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Health Predictions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthData.predictions.map((prediction, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {getMetricName(prediction.metric)}
                  </span>
                  {getTrendIcon(prediction.trend)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Current: <span className="font-medium">{prediction.currentValue}</span></div>
                  <div>Predicted: <span className="font-medium">{prediction.predictedValue}</span></div>
                  <div>Confidence: <span className="font-medium">{prediction.confidence}%</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Insights */}
      {healthData.insights.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Health Insights
          </h3>
          <div className="space-y-3">
            {healthData.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Low Risk', value: healthData.trends.filter(t => t.riskLevel === 'green').length, fill: '#10b981' },
                  { name: 'Medium Risk', value: healthData.trends.filter(t => t.riskLevel === 'yellow').length, fill: '#f59e0b' },
                  { name: 'High Risk', value: healthData.trends.filter(t => t.riskLevel === 'red').length, fill: '#ef4444' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Summary</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="steps" fill="#10b981" name="Steps" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
