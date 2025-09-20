const express = require('express');
const Medication = require('../models/Medication');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all medications for user
router.get('/', auth, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });
    
    res.json(medications);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new medication
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, frequency, times, startDate, endDate, instructions } = req.body;
    
    const medication = new Medication({
      userId: req.user._id,
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      instructions
    });
    
    // Calculate next reminder
    medication.nextReminder = medication.calculateNextReminder();
    
    await medication.save();
    
    res.status(201).json({
      message: 'Medication added successfully',
      medication
    });
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medication
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, dosage, frequency, times, startDate, endDate, instructions, isActive } = req.body;
    
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, dosage, frequency, times, startDate, endDate, instructions, isActive },
      { new: true, runValidators: true }
    );
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Recalculate next reminder
    medication.nextReminder = medication.calculateNextReminder();
    await medication.save();
    
    res.json({
      message: 'Medication updated successfully',
      medication
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete medication
router.delete('/:id', auth, async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark medication as taken
router.post('/:id/taken', auth, async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    medication.lastTaken = new Date();
    medication.nextReminder = medication.calculateNextReminder();
    await medication.save();
    
    res.json({
      message: 'Medication marked as taken',
      medication
    });
  } catch (error) {
    console.error('Mark taken error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming reminders
router.get('/reminders/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingMedications = await Medication.find({
      userId: req.user._id,
      isActive: true,
      nextReminder: { $gte: now, $lte: next24Hours }
    }).sort({ nextReminder: 1 });
    
    res.json(upcomingMedications);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
