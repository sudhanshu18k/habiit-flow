import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Camera, Upload, Image, Calendar, Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ProofEntry {
  id: string;
  habit_id: string;
  proof_image_url: string;
  notes: string;
  completed_at: string;
  mood_rating: number;
  habits: {
    title: string;
    icon: string;
    color: string;
  };
}

const ProofCenter: React.FC = () => {
  const { user } = useAuth();
  const [proofEntries, setProofEntries] = useState<ProofEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProofEntries();
  }, [user]);

  const fetchProofEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select(`
          *,
          habits (
            title,
            icon,
            color
          )
        `)
        .eq('user_id', user.id)
        .not('proof_image_url', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setProofEntries(data || []);
    } catch (error: any) {
      toast.error('Error fetching proof entries: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('habit-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('habit-proofs')
        .getPublicUrl(fileName);

      toast.success('Photo uploaded successfully! 📸');
      // Here you would typically associate this with a habit completion
      
    } catch (error: any) {
      toast.error('Error uploading photo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getMoodEmoji = (rating: number) => {
    const moods = ['😢', '😕', '😐', '😊', '😁'];
    return moods[rating - 1] || '😐';
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
          <h1 className="text-3xl font-bold text-gray-900">Proof Center</h1>
          <p className="text-gray-600">Visual evidence of your habit completions</p>
        </div>
        <div className="flex items-center space-x-4">
          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </motion.label>
        </div>
      </div>

      {/* Upload Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100"
      >
        <div className="flex items-start space-x-4">
          <Camera className="w-8 h-8 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How to Use Proof Center</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Take photos or screenshots when completing habits</li>
              <li>• Upload images as proof of your progress</li>
              <li>• Build a visual timeline of your achievements</li>
              <li>• Share your progress with friends and challenges</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Proof Gallery */}
      {proofEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <Image className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No proof photos yet</h3>
          <p className="text-gray-600 mb-6">Start uploading photos to document your habit journey!</p>
          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span>Upload First Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </motion.label>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proofEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={entry.proof_image_url}
                  alt="Habit proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                    <span className="text-white text-lg">{getMoodEmoji(entry.mood_rating || 3)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${entry.habits.color} flex items-center justify-center text-white text-sm`}>
                    {entry.habits.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{entry.habits.title}</h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(entry.completed_at), 'MMM dd, yyyy')}</span>
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(entry.completed_at), 'HH:mm')}</span>
                    </div>
                  </div>
                </div>
                
                {entry.notes && (
                  <p className="text-sm text-gray-600 mb-3">{entry.notes}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-2xl">{getMoodEmoji(entry.mood_rating || 3)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProofCenter;