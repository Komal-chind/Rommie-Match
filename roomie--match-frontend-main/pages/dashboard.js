// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import QuizComponent from '../components/quiz/QuizComponent';
import MoodWidget from '../components/mood/MoodWidget';
import CompatibilityChart from '../components/dashboard/CompatibilityChart';
import ResultsCard from '../components/dashboard/ResultsCard';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  subscribeToDashboardStats, 
  subscribeToCompatibility, 
  subscribeToRecentActivity,
  subscribeToMood,
  saveQuizAnswers
} from '../lib/firestore';
import MatchRequestsModal from '../components/matches/MatchRequestsModal';
import { collection, query, where, onSnapshot, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useChat } from '../contexts/ChatContext';
import ThisOrThatQuizComponent from '../components/quiz/ThisOrThatQuizComponent';

export default function Dashboard() {
  const { userData, user } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMatchRequests, setShowMatchRequests] = useState(false);
  const [userCompatibility, setUserCompatibility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    activeMatches: 0,
    messageCount: 0,
    profileViews: 0,
    matchRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [hasTakenQuiz, setHasTakenQuiz] = useState(false);
  const router = useRouter();
  const { unreadCount, markAllMessagesAsRead } = useChat();
  const [activeMatches, setActiveMatches] = useState([]);
  const [showActiveMatchesModal, setShowActiveMatchesModal] = useState(false);
  const [showThisOrThat, setShowThisOrThat] = useState(false);
  const [hasPlayedThisOrThat, setHasPlayedThisOrThat] = useState(false);

  // Set up real-time listeners
  useEffect(() => {
    if (!user) return;

    // Real-time match requests count
    const requestsQuery = query(
      collection(db, 'roomie-users', user.uid, 'match-requests'),
      where('status', '==', 'pending')
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      setDashboardStats((prev) => ({
        ...prev,
        matchRequests: snapshot.docs.length
      }));
    });

    // Real-time unread messages count (per-message, cross-user)
    let messageUnsubscribers = [];
    const chatsQuery = query(
      collection(db, 'roomie-users', user.uid, 'chats')
    );
    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      // Unsubscribe previous listeners
      messageUnsubscribers.forEach(unsub => unsub());
      messageUnsubscribers = [];
      let totalUnread = 0;
      const chatDocs = snapshot.docs;
      if (chatDocs.length === 0) {
        setDashboardStats((prev) => ({ ...prev, messageCount: 0 }));
        return;
      }
      let processed = 0;
      chatDocs.forEach(chatDoc => {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find(id => id !== user.uid);
        if (!otherUserId) {
          processed++;
          if (processed === chatDocs.length) {
            setDashboardStats((prev) => ({ ...prev, messageCount: totalUnread }));
          }
          return;
        }
        const messagesQuery = query(
          collection(db, 'roomie-users', otherUserId, 'chats', chatDoc.id, 'messages'),
          where('receiverId', '==', user.uid),
          where('read', '==', false)
        );
        const unsub = onSnapshot(messagesQuery, (messagesSnapshot) => {
          // For each chat, count unread messages for this user
          totalUnread += messagesSnapshot.size;
          processed++;
          if (processed === chatDocs.length) {
            setDashboardStats((prev) => ({ ...prev, messageCount: totalUnread }));
          }
        });
        messageUnsubscribers.push(unsub);
      });
    });

    const unsubscribeStats = subscribeToDashboardStats(user.uid, (stats) => {
      setDashboardStats((prev) => ({ ...prev, ...stats }));
      setIsLoading(false);
    });

    const unsubscribeCompatibility = subscribeToCompatibility(user.uid, (compatibility) => {
      setUserCompatibility(compatibility);
    });

    const unsubscribeActivity = subscribeToRecentActivity(user.uid, (activities) => {
      setRecentActivity(activities);
    });

    // Check if user has taken the quiz
    const checkQuizStatus = async () => {
      const quizDoc = await getDoc(doc(db, 'roomie-users', user.uid, 'quiz', 'answers'));
      setHasTakenQuiz(quizDoc.exists());
    };
    
    checkQuizStatus();

    // Check if user has played ThisOrThat
    const checkThisOrThat = async () => {
      const userDoc = await getDoc(doc(db, 'roomie-users', user.uid));
      setHasPlayedThisOrThat(!!userDoc.data()?.thisOrThatCompleted);
    };
    checkThisOrThat();

    // Fetch active matches (accepted requests)
    const matchesRef = collection(db, 'roomie-users', user.uid, 'matches');
    const unsubscribeMatches = onSnapshot(matchesRef, async (snapshot) => {
      const matchesData = await Promise.all(snapshot.docs.map(async docSnap => {
        const match = docSnap.data();
        let matchedUserName = '';
        try {
          const matchedUserDoc = await getDoc(doc(db, 'roomie-users', match.userId));
          if (matchedUserDoc.exists()) {
            matchedUserName = matchedUserDoc.data().name || match.userId;
          } else {
            matchedUserName = match.userId;
          }
        } catch {}
        return {
          id: docSnap.id,
          ...match,
          matchedUserName
        };
      }));
      setActiveMatches(matchesData);
      setDashboardStats((prev) => ({ ...prev, activeMatches: matchesData.length }));
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeRequests();
      unsubscribeChats();
      messageUnsubscribers.forEach(unsub => unsub());
      unsubscribeStats();
      unsubscribeCompatibility();
      unsubscribeActivity();
      unsubscribeMatches();
    };
  }, [user]);

  // Handle quiz completion
  const handleQuizComplete = async (answers) => {
    if (!user) return;
    
    try {
      await saveQuizAnswers(user.uid, answers);
      setShowQuiz(false);
      setHasTakenQuiz(true);
    } catch (error) {
      console.error('Error saving quiz answers:', error);
    }
  };

  // Handle quiz retake
  const handleQuizRetake = () => {
    setShowQuiz(true);
  };

  // Animated gradient particles background effect
  const FloatingParticles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-pink-500/10 to-purple-600/10 blur-xl"
            style={{ 
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
            }}
            animate={{
              x: [Math.random() * 100, Math.random() * 100 - 50],
              y: [Math.random() * 100, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

  // Stats Card Component
  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-800"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  // Recent Activity Component
  const ActivityItem = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg"
    >
      <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center`}>
        {activity.icon}
      </div>
      <div>
        <p className="text-sm text-gray-300">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </motion.div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-black via-[#1a0826] to-black text-gray-100 flex flex-col relative overflow-x-hidden">
        <FloatingParticles />
        <Navbar />
        <main className="flex-grow pt-20 relative z-10">
          <div className="max-w-7xl mx-auto py-10 px-4 sm:px-8 lg:px-12">
            {/* Welcome message */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-400 to-purple-700 drop-shadow-glow tracking-tight mb-2">
                Welcome back, {userData?.name || user?.displayName || 'User'}!
              </h1>
              <p className="mt-2 text-lg md:text-2xl text-gray-400 font-light">
                {userData?.university ? 
                  `Find compatible roommates at ${userData.university}` :
                  'Complete your profile to find your perfect roommate match!'}
              </p>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px 0 #a21caf44" }}
                className="rounded-2xl bg-black/80 backdrop-blur-lg border border-purple-900/40 shadow-xl p-8 flex flex-col items-center transition-all hover:shadow-pink-900/30 hover:border-pink-700/40 hover:scale-105"
              >
                <span className="text-4xl mb-3 text-purple-300 drop-shadow-glow">👥</span>
                <span className="text-3xl font-extrabold text-gray-100 mb-1">{activeMatches.length}</span>
                <span className="text-base text-gray-300 font-medium">You have {activeMatches.length} active matches</span>
                <button
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-900 to-pink-900 text-gray-100 rounded-lg font-semibold shadow hover:from-pink-800 hover:to-purple-900 hover:shadow-pink-900/30 transition-all"
                  onClick={() => setShowActiveMatchesModal(true)}
                >
                  View
                </button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px 0 #a78bfa33" }}
                className="rounded-2xl bg-black/80 backdrop-blur-lg border border-purple-900/40 shadow-xl p-8 flex flex-col items-center transition-all hover:shadow-purple-900/30 hover:border-purple-700/40 hover:scale-105"
                onClick={() => { markAllMessagesAsRead(); router.push('/messages'); }}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-4xl mb-3 text-green-300 drop-shadow-glow">💬</span>
                <span className="text-3xl font-extrabold text-gray-100 mb-1">{unreadCount}</span>
                <span className="text-base text-gray-300 font-medium">New Messages</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px 0 #ec489944" }}
                className="rounded-2xl bg-black/80 backdrop-blur-lg border border-pink-900/40 shadow-xl p-8 flex flex-col items-center transition-all hover:shadow-pink-900/30 hover:border-pink-700/40 hover:scale-105"
                onClick={() => setShowMatchRequests(true)}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-4xl mb-3 text-pink-300 drop-shadow-glow">🤝</span>
                <span className="text-3xl font-extrabold text-gray-100 mb-1">{dashboardStats.matchRequests}</span>
                <span className="text-base text-gray-300 font-medium">Match Requests</span>
              </motion.div>
            </div>
            
            {/* Dashboard grid - responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* Mood tracking widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="col-span-1"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-black/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-900 h-full flex flex-col items-center">
                  <MoodWidget currentMood={userData?.currentMood} onMoodUpdate={(mood) => {
                    if (userData) {
                      userData.currentMood = mood;
                    }
                  }} />
                </div>
              </motion.div>
              {/* Recent conversations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="col-span-1 lg:col-span-1 md:col-span-2 lg:col-start-auto"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-black/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-900 h-full">
                  <ResultsCard
                    userId={user?.uid}
                    hasTakenQuiz={hasTakenQuiz}
                    onTakeQuiz={() => setShowQuiz(true)}
                    onRetakeQuiz={handleQuizRetake}
                    onPlayThisOrThat={() => setShowThisOrThat(true)}
                  />
                </div>
              </motion.div>
              {/* Roommate Tip of the Day */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="col-span-1 flex items-center justify-center"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="rounded-2xl bg-black/80 backdrop-blur-lg border border-purple-900/40 shadow-xl p-8 flex flex-col items-center transition-all w-full hover:shadow-pink-900/30 hover:border-pink-700/40 hover:scale-105">
                  <span className="text-4xl mb-3 text-pink-300 drop-shadow-glow">💡</span>
                  <h3 className="text-xl font-bold mb-2 text-gray-100">Roommate Tip</h3>
                  <p className="text-gray-300 mb-2 italic text-center">
                    "Communication is key! Set clear expectations with your roommate from the start."
                  </p>
                  <span className="text-xs text-pink-300">Tip of the Day</span>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      {showQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-pink-400 text-2xl font-bold z-10"
              onClick={() => setShowQuiz(false)}
              aria-label="Close"
            >
              ×
            </button>
            <QuizComponent />
          </div>
        </div>
      )}
      <MatchRequestsModal 
        isOpen={showMatchRequests}
        onClose={() => setShowMatchRequests(false)}
      />
      {/* Active Matches Modal */}
      {showActiveMatchesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-pink-700/30 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-pink-400">Active Matches</h2>
              <button
                onClick={() => setShowActiveMatchesModal(false)}
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {activeMatches.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No active matches</div>
            ) : (
              <div className="space-y-4">
                {activeMatches.map(match => (
                  <div key={match.id} className="border border-blue-700/30 rounded-xl p-4 bg-gray-800/70 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-200">{match.matchedUserName}</h4>
                      <p className="text-sm text-gray-400">Matched {match.matchedAt ? new Date(match.matchedAt.seconds ? match.matchedAt.seconds * 1000 : match.matchedAt).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Block roommate matching/results if ThisOrThat not played */}
      {!hasPlayedThisOrThat && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <ThisOrThatQuizComponent onComplete={() => setHasPlayedThisOrThat(true)} />
          </div>
        </div>
      )}
      {showThisOrThat && hasPlayedThisOrThat && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-pink-400 text-2xl font-bold z-10"
              onClick={() => setShowThisOrThat(false)}
              aria-label="Close"
            >
              ×
            </button>
            <ThisOrThatQuizComponent onComplete={() => { setShowThisOrThat(false); setHasPlayedThisOrThat(true); }} />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}