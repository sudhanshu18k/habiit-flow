import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { X, Target, Book, Code, Dumbbell, Heart, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editHabit?: any;
}

const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editHabit
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Health',
    frequency: 'daily' as 'daily' | 'weekly',
    targetCount: 1,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    icon: '🎯',
    color: 'bg-purple-500',
  });

  const categories = [
    { name: 'Health', icon: Heart, color: 'bg-red-500' },
    { name: 'Study', icon: Book, color: 'bg-blue-500' },
    { name: 'Coding', icon: Code, color: 'bg-green-500' },
    { name: 'Fitness', icon: Dumbbell, color: 'bg-orange-500' },
    { name: 'Mindfulness', icon: Brain, color: 'bg-purple-500' },
    { name: 'General', icon: Target, color: 'bg-gray-500' },
  ];

  const icons = ['🎯', '📚', '💪', '🧠', '❤️', '🏃', '💻', '📝', '🌱', '⭐'];
  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ];

  useEffect(() => {
    if (editHabit) {
      setFormData({
        title: editHabit.title,
        description: editHabit.description || '',
        category: editHabit.category,
        frequency: editHabit.frequency,
        targetCount: editHabit.target_count,
        difficulty: editHabit.difficulty,
        icon: editHabit.icon,
        color: editHabit.color,
      });
    }
  }, [editHabit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const habitData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        frequency: formData.frequency,
        target_count: formData.targetCount,
        difficulty: formData.difficulty,
        icon: formData.icon,
        color: formData.color,
      };

      if (editHabit) {
        const { error } = await supabase
          .from('habits')
          .update(habitData)
          .eq('id', editHabit.id);
        
        if (error) throw error;
        toast.success('Habit updated successfully!');
      } else {
        const { error } = await supabase
          .from('habits')
          .insert(habitData);
        
        if (error) throw error;
        toast.success('Habit created successfully!');
      }

      onSuccess();
      onClose();
      setFormData({
        title: '',
        description: '',
        category: 'Health',
        frequency: 'daily',
        targetCount: 1,
        difficulty: 'medium',
        icon: '🎯',
        color: 'bg-purple-500',
      });
    } catch (error: any) {
      toast.error('Error saving habit: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editHabit ? 'Edit Habit' : 'Create New Habit'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Morning meditation, Code review, Exercise"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of your habit..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <motion.button
                        key={category.name}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, category: category.name, color: category.color })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.category === category.name
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Count
                  </label>
                  <input
                    type="number"
                    value={formData.targetCount}
                    onChange={(e) => setFormData({ ...formData, targetCount: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'easy', label: 'Easy', color: 'text-green-600 border-green-500' },
                    { value: 'medium', label: 'Medium', color: 'text-yellow-600 border-yellow-500' },
                    { value: 'hard', label: 'Hard', color: 'text-red-600 border-red-500' },
                  ].map((difficulty) => (
                    <motion.button
                      key={difficulty.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, difficulty: difficulty.value as any })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.difficulty === difficulty.value
                          ? difficulty.color + ' bg-opacity-10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium">{difficulty.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Icon & Color
                </label>
                <div className="flex items-center space-x-4 mb-3">
                  <div className={`w-12 h-12 rounded-lg ${formData.color} flex items-center justify-center text-white text-xl`}>
                    {formData.icon}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {icons.map((icon) => (
                        <motion.button
                          key={icon}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-colors ${
                            formData.icon === icon
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {icon}
                        </motion.button>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map((color) => (
                        <motion.button
                          key={color}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-lg ${color} border-2 transition-colors ${
                            formData.color === color
                              ? 'border-gray-800'
                              : 'border-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                >
                  {loading ? 'Saving...' : editHabit ? 'Update Habit' : 'Create Habit'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateHabitModal;