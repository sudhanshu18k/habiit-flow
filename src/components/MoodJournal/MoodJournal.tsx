import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Heart, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

interface MoodEntry {
  id: string;
  user_id: string;
  mood_rating: number;
  reflection: string;
  created_at: string;
}

const MoodJournal: React.FC = () => {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const moods = [
    { value: 1, emoji: '😢', label: 'Terrible', color: 'bg-red-500' },
    { value: 2, emoji: '😕', label: 'Bad', color: 'bg-orange-500' },
    { value: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-500' },
    { value: 4, emoji: '😊', label: 'Good', color: 'bg-green-500' },
    { value: 5, emoji: '😁', label: 'Amazing', color: 'bg-blue-500' },
  ];

  useEffect(() => {
    fetchMoodEntries();
    checkTodayMood();
  }, [user]);

  const fetchMoodEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setMoodEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching mood entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayMood = async () => {
    if (!user) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setTodayMood(data[0].mood_rating);
        setReflection(data[0].reflection || '');
      }
    } catch (error) {
      // No mood entry for today, which is fine
    }
  };

  const submitMoodEntry = async () => {
    if (!user || todayMood === null) {
      toast.error('Please select a mood rating');
      return;
    }

    setSubmitting(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if entry exists for today
      const { data: existingEntry } = await supabase
        .from('mood_entries')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .single();

      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('mood_entries')
          .update({
            mood_rating: todayMood,
            reflection: reflection.trim() || null,
          })
          .eq('id', existingEntry.id);

        if (error) throw error;
        toast.success('Mood updated successfully! 💙');
      } else {
        // Create new entry
        const { error } = await supabase
          .from('mood_entries')
          .insert({
            user_id: user.id,
            mood_rating: todayMood,
            reflection: reflection.trim() || null,
          });

        if (error) throw error;
        toast.success('Mood recorded successfully! 💙');
      }

      fetchMoodEntries();
    } catch (error: any) {
      toast.error('Error saving mood entry: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodChartData = () => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = moodEntries.find(e => 
        format(new Date(e.created_at), 'yyyy-MM-dd') === dateStr
      );
      
      return {
        date: format(date, 'MMM dd'),
        mood: entry?.mood_rating || null,
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mood Journal</h1>
        <p className="text-gray-600">Track your daily mood and reflect on your journey</p>
      </motion.div>

      {/* Today's Mood Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling today?</h2>
        
        <div className="grid grid-cols-5 gap-3 mb-6">
          {moods.map((mood) => (
            <motion.button
              key={mood.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTodayMood(mood.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                todayMood === mood.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="text-sm font-medium text-gray-700">{mood.label}</div>
            </motion.button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daily Reflection (optional)
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="What made today special? Any insights or thoughts to remember..."
            rows={3}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={submitMoodEntry}
          disabled={submitting || todayMood === null}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : 'Save Today\'s Entry'}
        </motion.button>
      </motion.div>

      {/* Mood Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Mood Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={getMoodChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip 
              formatter={(value: any) => {
                if (value === null) return ['No entry', 'Mood'];
                const mood = moods.find(m => m.value === value);
                return [mood ? `${mood.emoji} ${mood.label}` : value, 'Mood'];
              }}
            />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Reflections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reflections</h3>
        {moodEntries.filter(entry => entry.reflection).length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No reflections yet. Start writing to track your thoughts and insights!
          </p>
        ) : (
          <div className="space-y-4">
            {moodEntries
              .filter(entry => entry.reflection)
              .slice(0, 5)
              .map((entry) => {
                const mood = moods.find(m => m.value === entry.mood_rating);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l-4 border-purple-500 pl-4 py-2"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{mood?.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {format(new Date(entry.created_at), 'MMMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{entry.reflection}</p>
                  </motion.div>
                );
              })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MoodJournal;