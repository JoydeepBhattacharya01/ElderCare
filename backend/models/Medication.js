const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['once', 'twice', 'three-times', 'four-times', 'as-needed']
  },
  times: [{
    hour: {
      type: Number,
      required: true,
      min: 0,
      max: 23
    },
    minute: {
      type: Number,
      required: true,
      min: 0,
      max: 59
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  instructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTaken: {
    type: Date
  },
  nextReminder: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate next reminder time
medicationSchema.methods.calculateNextReminder = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (const time of this.times) {
    const reminderTime = new Date(today.getTime() + time.hour * 60 * 60 * 1000 + time.minute * 60 * 1000);
    
    if (reminderTime > now) {
      return reminderTime;
    }
  }
  
  // If no time today, get first time tomorrow
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const firstTime = this.times[0];
  return new Date(tomorrow.getTime() + firstTime.hour * 60 * 60 * 1000 + firstTime.minute * 60 * 1000);
};

module.exports = mongoose.model('Medication', medicationSchema);
