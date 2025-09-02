import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Award, Target, Flame } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface AnalyticsData {
  weeklyProgress: any[];
  categoryBreakdown: any[];
  streakData: any[];
  completionRate: number;
  bestStreak: number;
  totalCompletions: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    weeklyProgress: [],
    categoryBreakdown: [],
    streakData: [],
    completionRate: 0,
    bestStreak: 0,
    totalCompletions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchAnalyticsData();
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

      // Fetch habits and completions
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const { data: completions } = await supabase
        .from('habit_completions')
        .select('*, habits(*)')
        .eq('user_id', user.id)
        .gte('completed_at', startDate);

      // Process weekly progress
      const dateRange = eachDayOfInterval({
        start: subDays(new Date(), days),
        end: new Date()
      });

      const weeklyProgress = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayCompletions = completions?.filter(c => 
          format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr
        ).length || 0;
        
        return {
          date: format(date, 'MMM dd'),
          completions: dayCompletions,
          target: habits?.length || 0
        };
      });

      // Process category breakdown
      const categoryMap = new Map();
      completions?.forEach(completion => {
        const category = completion.habits?.category || 'Other';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
        color: getCategoryColor(name)
      }));

      // Calculate completion rate
      const totalPossible = (habits?.length || 0) * days;
      const completionRate = totalPossible > 0 ? Math.round(((completions?.length || 0) / totalPossible) * 100) : 0;

      setAnalyticsData({
        weeklyProgress,
        categoryBreakdown,
        streakData: [], // Would calculate actual streaks
        completionRate,
        bestStreak: 12, // Mock data - would calculate from actual completions
        totalCompletions: completions?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Health': '#EF4444',
      'Study': '#3B82F6',
      'Coding': '#10B981',
      'Fitness': '#F59E0B',
      'Mindfulness': '#8B5CF6',
      'General': '#6B7280',
    };
    return colors[category] || '#6B7280';
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your progress and identify patterns</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.completionRate}%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Streak</p>
              <p className="text-2xl font-bold text-orange-600">{analyticsData.bestStreak} days</p>
            </div>
            <Flame className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Completions</p>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.totalCompletions}</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trend</p>
              <p className="text-2xl font-bold text-purple-600">↗ +15%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Habits by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.categoryBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/60 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Best Performance Day</h4>
            <p className="text-sm text-gray-600">You complete the most habits on Mondays. Consider scheduling challenging habits early in the week.</p>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📈 Growth Opportunity</h4>
            <p className="text-sm text-gray-600">Your coding habits have a 85% completion rate. Try adding more programming challenges!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;