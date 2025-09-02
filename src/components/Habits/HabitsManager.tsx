import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, Edit3, Trash2, CheckCircle, Circle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateHabitModal from './CreateHabitModal';

interface Habit {
  id: string;
  title: string;
  description: string | null;
  category: string;
  frequency: 'daily' | 'weekly';
  target_count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  icon: string;
  color: string;
  completions?: any[];
}

const HabitsManager: React.FC = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  useEffect(() => {
    fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select(`
          *,
          habit_completions (
            completed_at,
            mood_rating
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error: any) {
      toast.error('Error fetching habits: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const completeHabit = async (habitId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('Habit completed! 🎉');
      fetchHabits();
    } catch (error: any) {
      toast.error('Error completing habit: ' + error.message);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId);

      if (error) throw error;
      
      toast.success('Habit deleted successfully');
      fetchHabits();
    } catch (error: any) {
      toast.error('Error deleting habit: ' + error.message);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isCompletedToday = (habit: Habit) => {
    if (!habit.completions) return false;
    const today = new Date().toDateString();
    return habit.completions.some(completion => 
      new Date(completion.completed_at).toDateString() === today
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600">Manage and track your daily habits</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          <span>Add Habit</span>
        </motion.button>
      </div>

      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <Target className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-6">Start building better habits today!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Create Your First Habit
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg ${habit.color} flex items-center justify-center text-white font-semibold text-lg`}>
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{habit.title}</h3>
                      <p className="text-sm text-gray-600">{habit.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedHabit(habit)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {habit.description && (
                  <p className="text-sm text-gray-600 mb-4">{habit.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(habit.difficulty)}`}>
                    {habit.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">
                    {habit.frequency} • Target: {habit.target_count}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => completeHabit(habit.id)}
                    disabled={isCompletedToday(habit)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isCompletedToday(habit)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {isCompletedToday(habit) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span>
                      {isCompletedToday(habit) ? 'Completed' : 'Mark Done'}
                    </span>
                  </motion.button>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-purple-600 border border-gray-200 rounded-lg hover:border-purple-200"
                      title="Add proof photo"
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                    <div className="text-xs text-gray-500">
                      {habit.completions?.length || 0} times
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchHabits}
        editHabit={selectedHabit}
      />
    </div>
  );
};

export default HabitsManager;