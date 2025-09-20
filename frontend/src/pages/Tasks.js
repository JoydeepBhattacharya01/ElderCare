import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  CheckSquare, 
  Edit, 
  Trash2, 
  CheckCircle,
  Circle,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    dueDate: '',
    isRecurring: false,
    recurringPattern: 'daily'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask._id}`, formData);
        toast.success('Task updated successfully');
      } else {
        await axios.post('/api/tasks', formData);
        toast.success('Task created successfully');
      }
      
      setShowAddForm(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        dueDate: '',
        isRecurring: false,
        recurringPattern: 'daily'
      });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      isRecurring: task.isRecurring,
      recurringPattern: task.recurringPattern
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${id}`);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const toggleTask = async (id) => {
    try {
      await axios.patch(`/api/tasks/${id}/toggle`);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'medium': return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'low': return 'bg-success-100 text-success-800 border-success-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'exercise': return '🏃‍♂️';
      case 'shopping': return '🛒';
      case 'calls': return '📞';
      case 'medical': return '🏥';
      case 'personal': return '👤';
      default: return '📝';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && task.isCompleted) ||
      (filter === 'pending' && !task.isCompleted) ||
      (filter === task.category);
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Daily Tasks</h1>
          <p className="text-lg text-gray-600">Manage your daily activities and to-dos</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-primary pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-primary"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="exercise">Exercise</option>
              <option value="shopping">Shopping</option>
              <option value="calls">Calls</option>
              <option value="medical">Medical</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-primary"
                placeholder="e.g., Take morning walk"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-primary"
                rows="3"
                placeholder="Add any additional details..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-primary"
                >
                  <option value="other">Other</option>
                  <option value="exercise">Exercise</option>
                  <option value="shopping">Shopping</option>
                  <option value="calls">Calls</option>
                  <option value="medical">Medical</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="input-primary"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-lg font-medium text-gray-700">Recurring Task</span>
              </label>
            </div>

            {formData.isRecurring && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Recurring Pattern
                </label>
                <select
                  name="recurringPattern"
                  value={formData.recurringPattern}
                  onChange={handleInputChange}
                  className="input-primary"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTask(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task._id} className={`card ${
              task.isCompleted ? 'opacity-75' : ''
            }`}>
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => toggleTask(task._id)}
                  className="mt-1 p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  {task.isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${
                        task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {getCategoryIcon(task.category)} {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-lg mt-1 ${
                          task.isCompleted ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          {task.category}
                        </span>
                        {task.isRecurring && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                            Recurring
                          </span>
                        )}
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {task.completedAt && (
                        <div className="flex items-center space-x-2 mt-2">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span className="text-sm text-success-600">
                            Completed: {new Date(task.completedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tasks Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first task to get started'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
