const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('medications')
      .populate('tasks')
      .populate('healthLogs');
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        healthCondition: user.healthCondition,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
