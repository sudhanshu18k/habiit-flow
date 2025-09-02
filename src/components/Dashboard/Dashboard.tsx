import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Flame, Target, TrendingUp } from 'lucide-react';
import { format, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface DashboardStats {
  totalHabits: number;
  todayCompleted: number;
  currentStreak: number;
  weeklyCompletion: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalHabits: 0,
    todayCompleted: 0,
    currentStreak: 0,
    weeklyCompletion: 0,
  });
  const [recentHabits, setRecentHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch habits
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Fetch today's completions
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: todayCompletions } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`);

      // Fetch week's completions
      const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');
      const { data: weekCompletions } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', `${weekStart}T00:00:00`)
        .lt('completed_at', `${weekEnd}T23:59:59`);

      // Fetch recent habits with completions
      const { data: recentHabitsData } = await supabase
        .from('habits')
        .select(`
          *,
          habit_completions!inner (
            completed_at,
            mood_rating
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(5)
        .order('updated_at', { ascending: false });

      setStats({
        totalHabits: habits?.length || 0,
        todayCompleted: todayCompletions?.length || 0,
        currentStreak: 7, // This would be calculated based on consecutive days
        weeklyCompletion: Math.round(((weekCompletions?.length || 0) / 7) * 100),
      });

      setRecentHabits(recentHabitsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Good morning! 👋
        </h1>
        <p className="text-gray-600">Let's make today count with your daily habits.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Target}
          title="Total Habits"
          value={stats.totalHabits}
          subtitle="Active habits"
          color="text-purple-600"
        />
        <StatCard
          icon={Calendar}
          title="Today's Progress"
          value={`${stats.todayCompleted}/${stats.totalHabits}`}
          subtitle="Completed today"
          color="text-blue-600"
        />
        <StatCard
          icon={Flame}
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          subtitle="Keep it going!"
          color="text-orange-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Weekly Completion"
          value={`${stats.weeklyCompletion}%`}
          subtitle="This week's average"
          color="text-green-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Habits */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Habits</h2>
          {recentHabits.length > 0 ? (
            <div className="space-y-3">
              {recentHabits.slice(0, 5).map((habit) => (
                <motion.div
                  key={habit.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={`w-3 h-3 rounded-full ${habit.color}`}></div>
                  <span className="flex-1 font-medium text-gray-900">{habit.title}</span>
                  <span className="text-sm text-gray-500">{habit.category}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No habits yet. Create your first habit to get started!
            </p>
          )}
        </motion.div>

        {/* Mood Tracker */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How are you feeling today?</h2>
          <div className="grid grid-cols-5 gap-2">
            {[
              { emoji: '😢', label: 'Sad', value: 1 },
              { emoji: '😕', label: 'Down', value: 2 },
              { emoji: '😐', label: 'Okay', value: 3 },
              { emoji: '😊', label: 'Good', value: 4 },
              { emoji: '😁', label: 'Great', value: 5 },
            ].map((mood) => (
              <motion.button
                key={mood.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-lg hover:bg-white/60 transition-colors text-center"
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className="text-xs text-gray-600">{mood.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;