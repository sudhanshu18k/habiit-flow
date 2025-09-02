import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, Trophy, Calendar, Plus, Crown, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateChallengeModal from './CreateChallengeModal';

interface Challenge {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_participants: number | null;
  created_at: string;
  participants?: any[];
  creator?: any;
}

const Challenges: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myParticipations, setMyParticipations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('public');

  useEffect(() => {
    fetchChallenges();
    fetchMyParticipations();
  }, [user]);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error: any) {
      toast.error('Error fetching challenges: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyParticipations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('challenge_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setMyParticipations(data?.map(p => p.challenge_id) || []);
    } catch (error: any) {
      console.error('Error fetching participations:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
        });

      if (error) throw error;
      
      toast.success('Joined challenge successfully! 🎉');
      fetchMyParticipations();
    } catch (error: any) {
      toast.error('Error joining challenge: ' + error.message);
    }
  };

  const leaveChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Left challenge successfully');
      fetchMyParticipations();
    } catch (error: any) {
      toast.error('Error leaving challenge: ' + error.message);
    }
  };

  const isParticipating = (challengeId: string) => {
    return myParticipations.includes(challengeId);
  };

  const filteredChallenges = activeTab === 'my' 
    ? challenges.filter(c => myParticipations.includes(c.id) || c.creator_id === user?.id)
    : challenges;

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
          <h1 className="text-3xl font-bold text-gray-900">Social Challenges</h1>
          <p className="text-gray-600">Join challenges and stay accountable with friends</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          <span>Create Challenge</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
        <button
          onClick={() => setActiveTab('public')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'public'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Public Challenges
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'my'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          My Challenges
        </button>
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'my' ? 'No challenges joined yet' : 'No public challenges available'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'my' 
              ? 'Join a public challenge or create your own to get started!'
              : 'Be the first to create a challenge for the community!'
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Create Challenge
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                      <p className="text-sm text-gray-600">
                        by {challenge.creator?.full_name || challenge.creator?.username || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  {challenge.creator_id === user?.id && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {challenge.description}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(challenge.start_date), 'MMM dd')} - {format(new Date(challenge.end_date), 'MMM dd')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{challenge.max_participants ? `0/${challenge.max_participants}` : '∞'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {isParticipating(challenge.id) ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => leaveChallenge(challenge.id)}
                      className="flex-1 py-2 px-4 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                    >
                      Leave Challenge
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => joinChallenge(challenge.id)}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      Join Challenge
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchChallenges}
      />
    </div>
  );
};

export default Challenges;