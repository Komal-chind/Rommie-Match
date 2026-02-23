import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import RoommateList from '../components/roommates/RoommateList';
import RoommateFilters from '../components/roommates/RoommateFilters';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import ThisOrThatQuizComponent from '../components/quiz/ThisOrThatQuizComponent';

const FindRoommates = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showThisOrThat, setShowThisOrThat] = useState(false);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="bg-black min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32">
            {/* Header Section */}
            <div className="mb-20 text-center">
              <h1 className="text-6xl font-bold mb-6 font-serif" style={{ 
                background: 'linear-gradient(to right, #ff6b6b, #6b6bff, #6bffb5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 5px rgba(255,255,255,0.2)'
              }}>Find Roommates</h1>
              <p className="text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                Discover potential roommates who match your preferences and lifestyle
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center mb-16 space-x-6">
              <button
                onClick={() => setShowThisOrThat(true)}
                className="flex items-center px-8 py-4 bg-transparent border-2 border-pink-500 rounded-xl text-pink-400 hover:bg-pink-900 hover:bg-opacity-30 transition-all duration-300 shadow-lg hover:shadow-pink-500/30"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Update Preferences
              </button>
            </div>
            
            {/* Roommate List */}
            <div className="bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800 backdrop-blur-sm bg-opacity-80">
              <RoommateList currentUser={user} filters={filters} />
            </div>

            {/* Form Submission Message */}
            <AnimatePresence>
              {formSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="text-center text-white mt-8"
                >
                  Thank you!
                </motion.div>
              )}
            </AnimatePresence>

            {/* ThisOrThatQuiz Modal */}
            {showThisOrThat && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-pink-400 text-2xl font-bold z-10"
                    onClick={() => setShowThisOrThat(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <ThisOrThatQuizComponent onComplete={() => setShowThisOrThat(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default FindRoommates;