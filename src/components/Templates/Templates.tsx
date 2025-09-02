import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookOpen, Code, Dumbbell, Brain, Coffee, Target, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  habits: {
    title: string;
    description: string;
    category: string;
    frequency: 'daily' | 'weekly';
    difficulty: 'easy' | 'medium' | 'hard';
    icon: string;
  }[];
}

const Templates: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const templates: Template[] = [
    {
      id: 'exam-prep',
      name: 'Exam Preparation',
      description: 'Structured study routine for upcoming exams',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      habits: [
        {
          title: 'Morning Study Session',
          description: 'Focused study for 2 hours in the morning',
          category: 'Study',
          frequency: 'daily',
          difficulty: 'medium',
          icon: '📚',
        },
        {
          title: 'Practice Problems',
          description: 'Solve practice questions for 1 hour',
          category: 'Study',
          frequency: 'daily',
          difficulty: 'medium',
          icon: '✏️',
        },
        {
          title: 'Review Notes',
          description: 'Review and summarize daily learnings',
          category: 'Study',
          frequency: 'daily',
          difficulty: 'easy',
          icon: '📝',
        },
        {
          title: 'Mock Test',
          description: 'Take a full-length practice exam',
          category: 'Study',
          frequency: 'weekly',
          difficulty: 'hard',
          icon: '🎯',
        },
      ],
    },
    {
      id: 'coding-sprint',
      name: 'Coding Sprint',
      description: 'Intensive coding practice for skill development',
      icon: Code,
      color: 'from-green-500 to-emerald-600',
      habits: [
        {
          title: 'Daily Coding Challenge',
          description: 'Solve 2-3 algorithmic problems',
          category: 'Coding',
          frequency: 'daily',
          difficulty: 'medium',
          icon: '💻',
        },
        {
          title: 'Project Development',
          description: 'Work on personal project for 1 hour',
          category: 'Coding',
          frequency: 'daily',
          difficulty: 'medium',
          icon: '🚀',
        },
        {
          title: 'Code Review',
          description: 'Review and refactor existing code',
          category: 'Coding',
          frequency: 'daily',
          difficulty: 'easy',
          icon: '🔍',
        },
        {
          title: 'Learn New Technology',
          description: 'Study new frameworks or tools',
          category: 'Study',
          frequency: 'weekly',
          difficulty: 'hard',
          icon: '🌟',
        },
      ],
    },
    {
      id: 'balanced-student',
      name: 'Balanced Student Life',
      description: 'Maintain health, studies, and personal growth',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      habits: [
        {
          title: 'Morning Exercise',
          description: '30 minutes of physical activity',
          category: 'Fitness',
          frequency: 'daily',
          difficulty: 'medium',
          icon: '🏃',
        },
        {
          title: 'Study Session',
          description: 'Focused academic work for 2 hours',
          category: 'Study',
          frequency: 'daily',
          difficulty: 'medium',
          icon: '📖',
        },
        {
          title: 'Meditation',
          description: '10 minutes of mindfulness practice',
          category: 'Mindfulness',
          frequency: 'daily',
          difficulty: 'easy',
          icon: '🧘',
        },
        {
          title: 'Social Connection',
          description: 'Spend quality time with friends or family',
          category: 'General',
          frequency: 'weekly',
          difficulty: 'easy',
          icon: '👥',
        },
      ],
    },
    {
      id: 'productivity-boost',
      name: 'Productivity Boost',
      description: 'Maximize daily productivity and focus',
      icon: Coffee,
      color: 'from-orange-500 to-red-600',
      habits: [
        {
          title: 'Morning Routine',
          description: 'Consistent wake-up and preparation routine',
          category: 'General',
          frequency: 'daily',
          difficulty: 'easy',
          icon: '🌅',
        },
        {
          title: 'Deep Work Block',
          description: '2-hour focused work session without distractions',
          category: 'Study',
          frequency: 'daily',
          difficulty: 'hard',
          icon: '🎯',
        },
        {
          title: 'Task Planning',
          description: 'Plan tomorrow\'s tasks and priorities',
          category: 'General',
          frequency: 'daily',
          difficulty: 'easy',
          icon: '📋',
        },
        {
          title: 'Weekly Review',
          description: 'Reflect on progress and plan improvements',
          category: 'General',
          frequency: 'weekly',
          difficulty: 'medium',
          icon: '📊',
        },
      ],
    },
  ];

  const applyTemplate = async (template: Template) => {
    if (!user) return;

    setLoading(true);
    try {
      const habitsToCreate = template.habits.map(habit => ({
        user_id: user.id,
        title: habit.title,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
        target_count: 1,
        difficulty: habit.difficulty,
        icon: habit.icon,
        color: getCategoryColor(habit.category),
      }));

      const { error } = await supabase
        .from('habits')
        .insert(habitsToCreate);

      if (error) throw error;
      
      toast.success(`${template.name} template applied! ${template.habits.length} habits created 🎉`);
    } catch (error: any) {
      toast.error('Error applying template: ' + error.message);
    } finally {
      setLoading(false);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Routine Templates</h1>
        <p className="text-gray-600">Quick-start your habit journey with proven routines</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {templates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${template.color} p-6 text-white`}>
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className="w-8 h-8" />
                  <h3 className="text-xl font-bold">{template.name}</h3>
                </div>
                <p className="text-white/90">{template.description}</p>
              </div>

              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Included Habits ({template.habits.length})
                </h4>
                <div className="space-y-3 mb-6">
                  {template.habits.map((habit, habitIndex) => (
                    <div key={habitIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{habit.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 text-sm">{habit.title}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(habit.difficulty)}`}>
                              {habit.difficulty}
                            </span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                              {habit.frequency}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{habit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyTemplate(template)}
                  disabled={loading}
                  className={`w-full py-3 bg-gradient-to-r ${template.color} text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{loading ? 'Applying...' : 'Apply Template'}</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Templates;