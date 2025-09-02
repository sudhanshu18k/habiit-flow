import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Brain, Target, Lightbulb, Plus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface SuggestedHabit {
  title: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly';
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  reasoning: string;
}

const GoalBreakdown: React.FC = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [suggestedHabits, setSuggestedHabits] = useState<SuggestedHabit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set());

  const analyzeGoal = async () => {
    if (!goal.trim()) {
      toast.error('Please enter a goal to analyze');
      return;
    }

    setLoading(true);
    try {
      // Mock AI analysis - in production, this would call an AI service
      const mockSuggestions: SuggestedHabit[] = [
        {
          title: 'Daily Algorithm Practice',
          description: 'Solve 2 coding problems on LeetCode or HackerRank',
          category: 'Coding',
          frequency: 'daily',
          difficulty: 'medium',
          icon: '💻',
          reasoning: 'Regular problem-solving builds algorithmic thinking essential for technical interviews'
        },
        {
          title: 'System Design Study',
          description: 'Read system design articles or watch videos for 30 minutes',
          category: 'Study',
          frequency: 'daily',
          difficulty: 'medium',
          icon: '🏗️',
          reasoning: 'Understanding system design is crucial for senior developer roles'
        },
        {
          title: 'Mock Interview Practice',
          description: 'Practice coding interviews with peers or online platforms',
          category: 'Study',
          frequency: 'weekly',
          difficulty: 'hard',
          icon: '🎤',
          reasoning: 'Regular interview practice builds confidence and improves performance'
        },
        {
          title: 'Open Source Contribution',
          description: 'Contribute to open source projects or maintain your GitHub',
          category: 'Coding',
          frequency: 'weekly',
          difficulty: 'medium',
          icon: '🌟',
          reasoning: 'Open source contributions demonstrate real-world coding skills to employers'
        },
        {
          title: 'Technical Blog Writing',
          description: 'Write about your learning journey and technical insights',
          category: 'General',
          frequency: 'weekly',
          difficulty: 'easy',
          icon: '✍️',
          reasoning: 'Technical writing showcases communication skills and deepens understanding'
        }
      ];

      setSuggestedHabits(mockSuggestions);
      toast.success('Goal analyzed! Here are your personalized habit suggestions.');
    } catch (error: any) {
      toast.error('Error analyzing goal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitSelection = (index: number) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedHabits(newSelected);
  };

  const createSelectedHabits = async () => {
    if (!user || selectedHabits.size === 0) {
      toast.error('Please select at least one habit to create');
      return;
    }

    try {
      const habitsToCreate = Array.from(selectedHabits).map(index => {
        const habit = suggestedHabits[index];
        return {
          user_id: user.id,
          title: habit.title,
          description: habit.description,
          category: habit.category,
          frequency: habit.frequency,
          target_count: 1,
          difficulty: habit.difficulty,
          icon: habit.icon,
          color: getCategoryColor(habit.category),
        };
      });

      const { error } = await supabase
        .from('habits')
        .insert(habitsToCreate);

      if (error) throw error;
      
      toast.success(`${selectedHabits.size} habits created successfully! 🎉`);
      setSelectedHabits(new Set());
      setSuggestedHabits([]);
      setGoal('');
    } catch (error: any) {
      toast.error('Error creating habits: ' + error.message);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Health': 'bg-red-500',
      'Study': 'bg-blue-500',
      'Coding': 'bg-green-500',
      'Fitness': 'bg-orange-500',
      'Mindfulness': 'bg-purple-500',
      'General': 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Goal Breakdown</h1>
        <p className="text-gray-600">Transform your big goals into actionable daily habits</p>
      </motion.div>

      {/* Goal Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your major goal? 🎯
        </label>
        <div className="flex space-x-4">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Get a software engineering job at a top tech company"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={analyzeGoal}
            disabled={loading || !goal.trim()}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className="w-5 h-5" />
            <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Suggested Habits */}
      {suggestedHabits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Suggested Habits ({selectedHabits.size} selected)
            </h2>
            {selectedHabits.size > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createSelectedHabits}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create {selectedHabits.size} Habits</span>
              </motion.button>
            )}
          </div>

          <div className="space-y-4">
            {suggestedHabits.map((habit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer ${
                  selectedHabits.has(index)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => toggleHabitSelection(index)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg ${getCategoryColor(habit.category)} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                    {habit.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{habit.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(habit.difficulty)}`}>
                          {habit.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {habit.frequency}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{habit.description}</p>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{habit.reasoning}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Example Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200"
      >
        <h3 className="font-semibold text-gray-900 mb-4">💡 Example Goals for CSE Students</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Land a software engineering internship at Google',
            'Build and deploy 3 full-stack projects',
            'Master data structures and algorithms',
            'Contribute to 5 open source projects',
            'Prepare for technical interviews',
            'Learn machine learning and AI fundamentals'
          ].map((exampleGoal, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGoal(exampleGoal)}
              className="text-left p-3 bg-white/60 rounded-lg hover:bg-white transition-colors border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">{exampleGoal}</span>
                <ArrowRight className="w-3 h-3 text-gray-400 ml-auto" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default GoalBreakdown;