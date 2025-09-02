import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap } from 'lucide-react';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    isCSEStudent: false,
    yearOfStudy: 1,
  });

  const { signIn, signUp } = useAuth();
  const { resendVerificationEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailNotConfirmed(false);
    setInvalidCredentials(false);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const userData = {
          full_name: formData.fullName,
          username: formData.username,
          is_cse_student: formData.isCSEStudent,
          year_of_study: formData.yearOfStudy,
        };
        
        const { error } = await signUp(formData.email, formData.password, userData);
        if (error) throw error;
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      if (error.message === 'Email not confirmed') {
        setEmailNotConfirmed(true);
      } else if (error.message === 'Invalid login credentials') {
        setInvalidCredentials(true);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(formData.email);
      toast.success('Verification email sent!');
    } catch (resendError: any) {
      toast.error('Failed to resend email: ' + resendError.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <span className="text-white font-bold text-2xl">H</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">HabitFlow</h1>
          <p className="text-white/80">Track habits, build streaks, achieve goals</p>
        </div>

        <div className="flex bg-white/20 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              isLogin ? 'bg-white text-purple-600 shadow' : 'text-white/80'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !isLogin ? 'bg-white text-purple-600 shadow' : 'text-white/80'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {invalidCredentials && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm mb-2 font-medium">
                Invalid email or password
              </p>
              <p className="text-white/80 text-xs">
                Please check your email and password are correct. If you forgot your password, you can reset it using the forgot password option.
              </p>
            </div>
          )}

          {emailNotConfirmed && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-white text-sm mb-3">
                Please check your email and click the verification link to activate your account.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                className="w-full py-2 px-4 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Resend verification email
              </button>
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="cseStudent"
                  checked={formData.isCSEStudent}
                  onChange={(e) => setFormData({ ...formData, isCSEStudent: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                />
                <label htmlFor="cseStudent" className="text-white/80 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>I'm a CSE student</span>
                </label>
              </div>

              {formData.isCSEStudent && (
                <div>
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => setFormData({ ...formData, yearOfStudy: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value={1} className="text-gray-800">1st Year</option>
                    <option value={2} className="text-gray-800">2nd Year</option>
                    <option value={3} className="text-gray-800">3rd Year</option>
                    <option value={4} className="text-gray-800">4th Year</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-white/60" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-white/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthForm;