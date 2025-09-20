const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const { category, completed, priority } = req.query;
    
    let filter = { userId: req.user._id };
    
    if (category) filter.category = category;
    if (completed !== undefined) filter.isCompleted = completed === 'true';
    if (priority) filter.priority = priority;
    
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, isRecurring, recurringPattern } = req.body;
    
    const task = new Task({
      userId: req.user._id,
      title,
      description,
      category,
      priority,
      dueDate,
      isRecurring,
      recurringPattern
    });
    
    await task.save();
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, isRecurring, recurringPattern } = req.body;
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, description, category, priority, dueDate, isRecurring, recurringPattern },
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle task completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.isCompleted) {
      await task.markIncomplete();
    } else {
      await task.markCompleted();
    }
    
    res.json({
      message: `Task marked as ${task.isCompleted ? 'completed' : 'incomplete'}`,
      task
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user._id,
      category: req.params.category
    }).sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's tasks
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasks = await Task.find({
      userId: req.user._id,
      $or: [
        { dueDate: { $gte: today, $lt: tomorrow } },
        { dueDate: { $exists: false } }
      ]
    }).sort({ priority: 1, createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
