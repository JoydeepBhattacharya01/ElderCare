import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Pill, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Bell
} from 'lucide-react';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once',
    times: [{ hour: 8, minute: 0 }],
    startDate: '',
    endDate: '',
    instructions: ''
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get('/api/medications');
      setMedications(response.data);
    } catch (error) {
      toast.error('Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeChange = (index, field, value) => {
    const newTimes = [...formData.times];
    newTimes[index][field] = parseInt(value);
    setFormData(prev => ({
      ...prev,
      times: newTimes
    }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, { hour: 8, minute: 0 }]
    }));
  };

  const removeTimeSlot = (index) => {
    if (formData.times.length > 1) {
      setFormData(prev => ({
        ...prev,
        times: prev.times.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMedication) {
        await axios.put(`/api/medications/${editingMedication._id}`, formData);
        toast.success('Medication updated successfully');
      } else {
        await axios.post('/api/medications', formData);
        toast.success('Medication added successfully');
      }
      
      setShowAddForm(false);
      setEditingMedication(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'once',
        times: [{ hour: 8, minute: 0 }],
        startDate: '',
        endDate: '',
        instructions: ''
      });
      fetchMedications();
    } catch (error) {
      toast.error('Failed to save medication');
    }
  };

  const handleEdit = (medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times,
      startDate: medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : '',
      endDate: medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : '',
      instructions: medication.instructions || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await axios.delete(`/api/medications/${id}`);
        toast.success('Medication deleted successfully');
        fetchMedications();
      } catch (error) {
        toast.error('Failed to delete medication');
      }
    }
  };

  const markAsTaken = async (id) => {
    try {
      await axios.post(`/api/medications/${id}/taken`);
      toast.success('Medication marked as taken');
      fetchMedications();
    } catch (error) {
      toast.error('Failed to mark medication as taken');
    }
  };

  const getNextReminder = (medication) => {
    if (!medication.nextReminder) return 'Not scheduled';
    const now = new Date();
    const reminder = new Date(medication.nextReminder);
    const diff = reminder - now;
    
    if (diff < 0) return 'Overdue';
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return `In ${Math.floor(diff / 60000)} minutes`;
    if (diff < 86400000) return `In ${Math.floor(diff / 3600000)} hours`;
    return reminder.toLocaleDateString();
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
          <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
          <p className="text-lg text-gray-600">Manage your medication reminders</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingMedication ? 'Edit Medication' : 'Add New Medication'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="e.g., Metformin"
                  required
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="input-primary"
                >
                  <option value="once">Once daily</option>
                  <option value="twice">Twice daily</option>
                  <option value="three-times">Three times daily</option>
                  <option value="four-times">Four times daily</option>
                  <option value="as-needed">As needed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="input-primary"
                  required
                />
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Reminder Times
              </label>
              <div className="space-y-3">
                {formData.times.map((time, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={time.hour}
                      onChange={(e) => handleTimeChange(index, 'hour', e.target.value)}
                      className="input-primary w-20"
                      placeholder="Hour"
                    />
                    <span className="text-gray-500">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={time.minute}
                      onChange={(e) => handleTimeChange(index, 'minute', e.target.value)}
                      className="input-primary w-20"
                      placeholder="Min"
                    />
                    {formData.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add another time
                </button>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Instructions (Optional)
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                className="input-primary"
                rows="3"
                placeholder="e.g., Take with food"
              />
            </div>

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                {editingMedication ? 'Update Medication' : 'Add Medication'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMedication(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medications List */}
      <div className="space-y-4">
        {medications.length > 0 ? (
          medications.map((medication) => (
            <div key={medication._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Pill className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{medication.name}</h3>
                    <p className="text-lg text-gray-600">{medication.dosage}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {medication.frequency.replace('-', ' ')} • {medication.times.length} time(s) daily
                    </p>
                    {medication.instructions && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Instructions:</strong> {medication.instructions}
                      </p>
                    )}
                    
                    {/* Reminder Times */}
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Reminder Times:</p>
                      <div className="flex flex-wrap gap-2">
                        {medication.times.map((time, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                          >
                            {time.hour.toString().padStart(2, '0')}:{time.minute.toString().padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => markAsTaken(medication._id)}
                    className="btn-success text-sm py-2 px-4"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Taken
                  </button>
                  <button
                    onClick={() => handleEdit(medication)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(medication._id)}
                    className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Next Reminder */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Next Reminder:</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {getNextReminder(medication)}
                  </span>
                </div>
                {medication.lastTaken && (
                  <div className="mt-2 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="text-sm text-gray-600">
                      Last taken: {new Date(medication.lastTaken).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Medications Added</h3>
            <p className="text-gray-600 mb-6">Add your first medication to start receiving reminders</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add Your First Medication
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medications;
