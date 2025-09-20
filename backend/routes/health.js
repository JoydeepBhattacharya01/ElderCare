const express = require('express');
const HealthLog = require('../models/HealthLog');
const auth = require('../middleware/auth');

const router = express.Router();

// Get health logs for user
router.get('/logs', auth, async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const logs = await HealthLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await HealthLog.countDocuments({ userId: req.user._id });
    
    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get health logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new health log
router.post('/logs', auth, async (req, res) => {
  try {
    const { vitals, symptoms, mood, sleep, notes } = req.body;
    
    // Validate required fields
    if (!vitals && !symptoms && !mood && !sleep && !notes) {
      return res.status(400).json({ 
        message: 'At least one health metric must be provided' 
      });
    }
    
    // Clean and validate vitals data
    const cleanVitals = {};
    if (vitals) {
      if (vitals.heartRate && vitals.heartRate.value) {
        cleanVitals.heartRate = {
          value: parseFloat(vitals.heartRate.value),
          unit: vitals.heartRate.unit || 'bpm',
          status: vitals.heartRate.status || 'normal'
        };
      }
      if (vitals.bloodPressure && (vitals.bloodPressure.systolic || vitals.bloodPressure.diastolic)) {
        cleanVitals.bloodPressure = {
          systolic: vitals.bloodPressure.systolic ? parseFloat(vitals.bloodPressure.systolic) : undefined,
          diastolic: vitals.bloodPressure.diastolic ? parseFloat(vitals.bloodPressure.diastolic) : undefined,
          unit: vitals.bloodPressure.unit || 'mmHg',
          status: vitals.bloodPressure.status || 'normal'
        };
      }
      if (vitals.temperature && vitals.temperature.value) {
        cleanVitals.temperature = {
          value: parseFloat(vitals.temperature.value),
          unit: vitals.temperature.unit || '°F',
          status: vitals.temperature.status || 'normal'
        };
      }
      if (vitals.steps && vitals.steps.value) {
        cleanVitals.steps = {
          value: parseInt(vitals.steps.value),
          unit: vitals.steps.unit || 'steps',
          status: vitals.steps.status || 'normal'
        };
      }
      if (vitals.weight && vitals.weight.value) {
        cleanVitals.weight = {
          value: parseFloat(vitals.weight.value),
          unit: vitals.weight.unit || 'lbs',
          status: vitals.weight.status || 'normal'
        };
      }
    }
    
    // Clean sleep data
    const cleanSleep = {};
    if (sleep) {
      if (sleep.hours) {
        cleanSleep.hours = parseFloat(sleep.hours);
      }
      if (sleep.quality) {
        cleanSleep.quality = sleep.quality;
      }
    }
    
    const healthLog = new HealthLog({
      userId: req.user._id,
      vitals: Object.keys(cleanVitals).length > 0 ? cleanVitals : undefined,
      symptoms: symptoms && symptoms.length > 0 ? symptoms : undefined,
      mood: mood || undefined,
      sleep: Object.keys(cleanSleep).length > 0 ? cleanSleep : undefined,
      notes: notes && notes.trim() ? notes.trim() : undefined
    });
    
    const savedLog = await healthLog.save();
    
    res.status(201).json({
      message: 'Health log created successfully',
      healthLog: savedLog
    });
  } catch (error) {
    console.error('Create health log error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to save health log. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current vitals (mock data for demo)
router.get('/vitals', auth, async (req, res) => {
  try {
    // Generate mock vitals data
    const mockVitals = {
      heartRate: {
        value: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
        unit: 'bpm',
        status: 'normal'
      },
      bloodPressure: {
        systolic: Math.floor(Math.random() * 40) + 110, // 110-150
        diastolic: Math.floor(Math.random() * 20) + 70, // 70-90
        unit: 'mmHg',
        status: 'normal'
      },
      temperature: {
        value: (Math.random() * 2 + 97).toFixed(1), // 97-99°F
        unit: '°F',
        status: 'normal'
      },
      steps: {
        value: Math.floor(Math.random() * 5000) + 2000, // 2000-7000 steps
        unit: 'steps',
        status: 'normal'
      },
      weight: {
        value: (Math.random() * 20 + 140).toFixed(1), // 140-160 lbs
        unit: 'lbs',
        status: 'normal'
      }
    };
    
    // Adjust status based on values
    if (mockVitals.heartRate.value > 90) mockVitals.heartRate.status = 'high';
    if (mockVitals.heartRate.value < 70) mockVitals.heartRate.status = 'low';
    
    if (mockVitals.bloodPressure.systolic > 140 || mockVitals.bloodPressure.diastolic > 90) {
      mockVitals.bloodPressure.status = 'high';
    }
    
    if (mockVitals.temperature.value > 99) mockVitals.temperature.status = 'high';
    if (mockVitals.temperature.value < 97.5) mockVitals.temperature.status = 'low';
    
    if (mockVitals.steps.value < 3000) mockVitals.steps.status = 'low';
    if (mockVitals.steps.value > 6000) mockVitals.steps.status = 'high';
    
    res.json(mockVitals);
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get health risk analysis
router.get('/risk-analysis', auth, async (req, res) => {
  try {
    // Get recent health logs
    const recentLogs = await HealthLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(7); // Last 7 days
    
    if (recentLogs.length === 0) {
      return res.json({
        level: 'green',
        score: 0,
        message: 'No recent health data available. Please log your health information.',
        recommendations: ['Start logging your daily health metrics']
      });
    }
    
    // Calculate average risk score
    let totalRiskScore = 0;
    let logCount = 0;
    
    recentLogs.forEach(log => {
      const riskAnalysis = log.calculateHealthRisk();
      totalRiskScore += riskAnalysis.score;
      logCount++;
    });
    
    const averageRiskScore = totalRiskScore / logCount;
    
    // Determine overall risk level
    let level, message, recommendations;
    
    if (averageRiskScore <= 2) {
      level = 'green';
      message = 'Your health indicators are looking good!';
      recommendations = [
        'Continue maintaining your current healthy habits',
        'Keep up with regular exercise',
        'Stay hydrated and eat well'
      ];
    } else if (averageRiskScore <= 5) {
      level = 'yellow';
      message = 'Some health indicators need attention.';
      recommendations = [
        'Consider scheduling a check-up with your doctor',
        'Monitor your vitals more closely',
        'Ensure you\'re taking medications as prescribed',
        'Get adequate rest and sleep'
      ];
    } else {
      level = 'red';
      message = 'Multiple health concerns detected.';
      recommendations = [
        'Contact your healthcare provider immediately',
        'Review your medication schedule',
        'Consider emergency contact if symptoms worsen',
        'Rest and avoid strenuous activities'
      ];
    }
    
    res.json({
      level,
      score: Math.round(averageRiskScore * 10) / 10,
      message,
      recommendations,
      recentLogs: recentLogs.length,
      lastUpdated: recentLogs[0].date
    });
  } catch (error) {
    console.error('Health risk analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update health log
router.put('/logs/:id', auth, async (req, res) => {
  try {
    const { vitals, symptoms, mood, sleep, notes } = req.body;
    
    const healthLog = await HealthLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { vitals, symptoms, mood, sleep, notes },
      { new: true, runValidators: true }
    );
    
    if (!healthLog) {
      return res.status(404).json({ message: 'Health log not found' });
    }
    
    res.json({
      message: 'Health log updated successfully',
      healthLog
    });
  } catch (error) {
    console.error('Update health log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete health log
router.delete('/logs/:id', auth, async (req, res) => {
  try {
    const healthLog = await HealthLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!healthLog) {
      return res.status(404).json({ message: 'Health log not found' });
    }
    
    res.json({ message: 'Health log deleted successfully' });
  } catch (error) {
    console.error('Delete health log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get health trends and predictions
router.get('/trends', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get health logs for the specified period
    const healthLogs = await HealthLog.find({ 
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    if (healthLogs.length === 0) {
      return res.json({
        trends: [],
        predictions: [],
        insights: ['No health data available for analysis. Start logging your health metrics to see trends.']
      });
    }
    
    // Process data for trends
    const trends = healthLogs.map(log => {
      const riskAnalysis = log.calculateHealthRisk();
      return {
        date: log.date.toISOString().split('T')[0],
        heartRate: log.vitals?.heartRate?.value || null,
        systolic: log.vitals?.bloodPressure?.systolic || null,
        diastolic: log.vitals?.bloodPressure?.diastolic || null,
        temperature: log.vitals?.temperature?.value || null,
        steps: log.vitals?.steps?.value || null,
        weight: log.vitals?.weight?.value || null,
        mood: getMoodScore(log.mood),
        sleepHours: log.sleep?.hours || null,
        riskScore: riskAnalysis.score,
        riskLevel: riskAnalysis.level
      };
    });
    
    // Generate predictions based on trends
    const predictions = generatePredictions(trends);
    
    // Generate insights
    const insights = generateHealthInsights(trends);
    
    res.json({
      trends,
      predictions,
      insights,
      period: `${days} days`,
      totalLogs: healthLogs.length
    });
    
  } catch (error) {
    console.error('Health trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to convert mood to numeric score
function getMoodScore(mood) {
  const moodScores = {
    'terrible': 1,
    'poor': 2,
    'okay': 3,
    'good': 4,
    'excellent': 5
  };
  return moodScores[mood] || 3;
}

// Generate predictions based on historical data
function generatePredictions(trends) {
  if (trends.length < 3) return [];
  
  const predictions = [];
  const metrics = ['heartRate', 'systolic', 'diastolic', 'steps', 'weight', 'riskScore'];
  
  metrics.forEach(metric => {
    const values = trends.filter(t => t[metric] !== null).map(t => t[metric]);
    if (values.length >= 3) {
      const trend = calculateTrend(values);
      const lastValue = values[values.length - 1];
      const predictedValue = lastValue + trend;
      
      predictions.push({
        metric,
        currentValue: lastValue,
        predictedValue: Math.round(predictedValue * 100) / 100,
        trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        confidence: Math.min(95, Math.max(60, values.length * 10))
      });
    }
  });
  
  return predictions;
}

// Simple linear trend calculation
function calculateTrend(values) {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumXX = values.reduce((sum, _, x) => sum + x * x, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

// Generate health insights
function generateHealthInsights(trends) {
  const insights = [];
  
  if (trends.length === 0) return insights;
  
  // Analyze heart rate trends
  const heartRates = trends.filter(t => t.heartRate).map(t => t.heartRate);
  if (heartRates.length > 0) {
    const avgHeartRate = heartRates.reduce((a, b) => a + b, 0) / heartRates.length;
    if (avgHeartRate > 90) {
      insights.push('Your average heart rate is elevated. Consider stress management techniques.');
    } else if (avgHeartRate < 60) {
      insights.push('Your heart rate is quite low. This could indicate good fitness or may need medical attention.');
    }
  }
  
  // Analyze blood pressure trends
  const systolicValues = trends.filter(t => t.systolic).map(t => t.systolic);
  if (systolicValues.length > 0) {
    const avgSystolic = systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length;
    if (avgSystolic > 140) {
      insights.push('Your blood pressure readings are consistently high. Please consult your doctor.');
    }
  }
  
  // Analyze activity levels
  const stepCounts = trends.filter(t => t.steps).map(t => t.steps);
  if (stepCounts.length > 0) {
    const avgSteps = stepCounts.reduce((a, b) => a + b, 0) / stepCounts.length;
    if (avgSteps < 3000) {
      insights.push('Your daily activity is below recommended levels. Try to increase your daily steps.');
    } else if (avgSteps > 8000) {
      insights.push('Great job maintaining an active lifestyle! Keep up the good work.');
    }
  }
  
  // Analyze mood trends
  const moodScores = trends.filter(t => t.mood).map(t => t.mood);
  if (moodScores.length > 0) {
    const avgMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
    if (avgMood < 2.5) {
      insights.push('Your mood has been consistently low. Consider talking to a healthcare professional.');
    } else if (avgMood > 4) {
      insights.push('Your mood has been consistently positive. That\'s wonderful for your overall health!');
    }
  }
  
  // Analyze sleep patterns
  const sleepHours = trends.filter(t => t.sleepHours).map(t => t.sleepHours);
  if (sleepHours.length > 0) {
    const avgSleep = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
    if (avgSleep < 6) {
      insights.push('You\'re not getting enough sleep. Aim for 7-9 hours per night for better health.');
    } else if (avgSleep > 9) {
      insights.push('You might be sleeping too much. Consider evaluating your sleep quality.');
    }
  }
  
  // Overall risk assessment
  const riskScores = trends.filter(t => t.riskScore).map(t => t.riskScore);
  if (riskScores.length > 0) {
    const recentRisk = riskScores.slice(-7); // Last 7 readings
    const avgRecentRisk = recentRisk.reduce((a, b) => a + b, 0) / recentRisk.length;
    
    if (avgRecentRisk > 5) {
      insights.push('Your recent health risk scores are elevated. Please schedule a check-up with your doctor.');
    } else if (avgRecentRisk < 2) {
      insights.push('Your health metrics look great! Continue your healthy habits.');
    }
  }
  
  return insights;
}

module.exports = router;
