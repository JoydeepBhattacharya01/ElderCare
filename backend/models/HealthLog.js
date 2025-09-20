const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  vitals: {
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' },
      status: { type: String, enum: ['normal', 'high', 'low'], default: 'normal' }
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: { type: String, default: 'mmHg' },
      status: { type: String, enum: ['normal', 'high', 'low'], default: 'normal' }
    },
    temperature: {
      value: Number,
      unit: { type: String, default: '°F' },
      status: { type: String, enum: ['normal', 'high', 'low'], default: 'normal' }
    },
    steps: {
      value: Number,
      unit: { type: String, default: 'steps' },
      status: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' }
    },
    weight: {
      value: Number,
      unit: { type: String, default: 'lbs' },
      status: { type: String, enum: ['normal', 'high', 'low'], default: 'normal' }
    }
  },
  symptoms: [{
    name: String,
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
    notes: String
  }],
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'poor', 'terrible'],
    default: 'good'
  },
  sleep: {
    hours: Number,
    quality: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate health risk score
healthLogSchema.methods.calculateHealthRisk = function() {
  let riskScore = 0;
  const vitals = this.vitals;
  
  // Heart rate analysis
  if (vitals.heartRate && vitals.heartRate.value) {
    if (vitals.heartRate.value < 60 || vitals.heartRate.value > 100) {
      riskScore += 2;
    }
  }
  
  // Blood pressure analysis
  if (vitals.bloodPressure && vitals.bloodPressure.systolic && vitals.bloodPressure.diastolic) {
    if (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.diastolic > 90) {
      riskScore += 3;
    } else if (vitals.bloodPressure.systolic < 90 || vitals.bloodPressure.diastolic < 60) {
      riskScore += 2;
    }
  }
  
  // Temperature analysis
  if (vitals.temperature && vitals.temperature.value) {
    if (vitals.temperature.value > 100.4 || vitals.temperature.value < 97) {
      riskScore += 2;
    }
  }
  
  // Steps analysis
  if (vitals.steps && vitals.steps.value) {
    if (vitals.steps.value < 2000) {
      riskScore += 1;
    }
  }
  
  // Mood analysis
  if (this.mood === 'poor' || this.mood === 'terrible') {
    riskScore += 1;
  }
  
  // Sleep analysis
  if (this.sleep && this.sleep.hours) {
    if (this.sleep.hours < 6 || this.sleep.hours > 9) {
      riskScore += 1;
    }
  }
  
  // Symptoms analysis
  if (this.symptoms && this.symptoms.length > 0) {
    riskScore += this.symptoms.length;
  }
  
  // Determine risk level
  if (riskScore <= 2) {
    return { level: 'green', score: riskScore, message: 'Your health looks good! Keep up the great work.' };
  } else if (riskScore <= 5) {
    return { level: 'yellow', score: riskScore, message: 'Some health indicators need attention. Consider consulting your doctor.' };
  } else {
    return { level: 'red', score: riskScore, message: 'Multiple health concerns detected. Please contact your healthcare provider immediately.' };
  }
};

module.exports = mongoose.model('HealthLog', healthLogSchema);
