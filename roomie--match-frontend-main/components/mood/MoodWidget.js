import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToMood, updateUserMood } from '../../lib/firestore';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const moods = [
  { emoji: '😄', name: 'Great', color: 'bg-green-500', hoverColor: 'hover:bg-green-600', textColor: 'text-green-500' },
  { emoji: '🙂', name: 'Good', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', textColor: 'text-blue-500' },
  { emoji: '😐', name: 'Okay', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-600', textColor: 'text-yellow-500' },
  { emoji: '😴', name: 'Tired', color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600', textColor: 'text-purple-500' },
  { emoji: '😰', name: 'Stressed', color: 'bg-red-500', hoverColor: 'hover:bg-red-600', textColor: 'text-red-500' },
  { emoji: '😢', name: 'Sad', color: 'bg-gray-500', hoverColor: 'hover:bg-gray-600', textColor: 'text-gray-500' }
];

// Background particle component (no animation)
const FloatingParticle = ({ delay, duration, x, y }) => (
  <div
    className="absolute w-2 h-2 bg-white/20 rounded-full"
    style={{ left: x, top: y, opacity: 0.5 }}
  />
);

const getLatestMood = async (userId) => {
  const moodQuery = query(
    collection(db, 'moods'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  const snapshot = await getDocs(moodQuery);
  if (!snapshot.empty) {
    return snapshot.docs[0].data();
  }
  return null;
};

export default function MoodWidget() {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fallback mood for initial render
  const fallbackMood = moods[0];
  const moodToShow = selectedMood || fallbackMood;

  // Subscribe to mood updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToMood(user.uid, (moodData) => {
      if (moodData) {
        setSelectedMood(moodData.mood);
        setLastUpdated(moodData.timestamp?.toDate());
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleMoodSelect = async (mood) => {
    if (!user || isUpdating) return;

    try {
      setIsUpdating(true);
      await updateUserMood(user.uid, mood);
      setSelectedMood(mood);
      setLastUpdated(new Date());
      setIsExpanded(false);
    } catch (error) {
      console.error('Error updating mood:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      className="relative bg-black rounded-xl border border-gray-800 shadow-lg overflow-hidden"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {/* Floating particles are now handled by the subscribeToMood function */}
      </div>
      
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-pink-900/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 p-4">
        {/* Header with gradient text */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
            Your Current Mood
          </h3>
        </div>
        
        {/* Current mood selector */}
        <div
          onClick={() => !isUpdating && setIsExpanded(!isExpanded)}
          className={`cursor-pointer rounded-lg flex items-center justify-between mb-4 
                    border border-gray-700/50 transition-all duration-300 backdrop-blur-sm
                    bg-gradient-to-r ${moodToShow.color} hover:shadow-glow-sm
                    ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center p-4 gap-3">
            <span className="text-2xl">{moodToShow.emoji}</span>
            <span className={`font-medium ${moodToShow.textColor}`}>{moodToShow.name}</span>
          </div>
          
          <div className="pr-4">
            {isUpdating ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <span 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/50 text-gray-300 text-sm"
              >
                {isExpanded ? "×" : "↓"}
              </span>
            )}
          </div>
        </div>
        
        {/* Expanded mood options */}
        {isExpanded && !isUpdating && (
          <div 
            className="grid grid-cols-3 gap-2 mb-4"
          >
            {moods.map((mood, index) => (
              <div
                key={index}
                onClick={() => handleMoodSelect(mood)}
                className={`bg-gradient-to-br ${mood.color} ${mood.hoverColor} 
                          transition-all duration-200 p-3 rounded-lg flex flex-col items-center 
                          justify-center backdrop-blur-sm border border-gray-700/50
                          ${selectedMood?.name === mood.name ? 'ring-2 ring-pink-500 ring-offset-1 ring-offset-black' : ''}`}
              >
                <span className="text-2xl mb-1">{mood.emoji}</span>
                <span className={`text-sm font-medium ${mood.textColor}`}>{mood.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Last updated info */}
        <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
          <span>Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "Never"}</span>
          
          {!isExpanded && !isUpdating && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs font-medium relative group"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                Update Your Mood
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}