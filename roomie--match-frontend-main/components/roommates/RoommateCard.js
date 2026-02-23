import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc, setDoc, updateDoc, increment, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const RoommateCard = ({ roommate }) => {
  const router = useRouter();
  const { startChat } = useChat();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatibility, setCompatibility] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  
  // Extract needed user data, with defaults for safety
  const {
    id,
    name = 'Anonymous',
    photoURL = '',
    bio = 'No bio available',
    preferences = {},
    age = null,
    gender = 'Not specified',
    occupation = 'Not specified',
    moveInDate = null,
    matchScore = null
  } = roommate;

  // Format data for display
  const formattedMoveInDate = moveInDate ? new Date(moveInDate.seconds * 1000).toLocaleDateString() : 'Flexible';
  
  // Calculate match percentage if available
  const matchPercentage = matchScore ? Math.round(matchScore * 100) : null;

  const handleMessageClick = async () => {
    try {
      const chat = await startChat(roommate.id);
      router.push(`/messages?chatId=${chat.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleMatchRequest = async () => {
    if (!user?.uid) {
      alert('You must be logged in to send a match request.');
      return;
    }
    setRequestLoading(true);
    try {
      // Get sender's user data
      const senderDoc = await getDoc(doc(db, 'roomie-users', user.uid));
      const senderData = senderDoc.exists() ? senderDoc.data() : null;
      const senderName =
        senderData?.name ||
        user.displayName ||
        user.email?.split('@')[0] ||
        'Anonymous';

      console.log('Sending match request with senderName:', senderName);
      // Post match request to receiver's subcollection
      const requestRef = doc(db, 'roomie-users', roommate.id, 'match-requests', user.uid);
      await setDoc(requestRef, {
        senderId: user.uid,
        receiverId: roommate.id,
        status: 'pending',
        createdAt: new Date(),
        senderName: senderName,
        receiverName: roommate.name
      });

      // Create notification for receiver
      const notificationObj = {
        type: 'match-request',
        senderId: user.uid,
        senderName: senderName,
        message: `${senderName} sent you a match request`,
        read: false,
        createdAt: new Date()
      };
      console.log('Notification object being created:', notificationObj);
      const notificationRef = doc(collection(db, 'roomie-users', roommate.id, 'notifications'));
      await setDoc(notificationRef, notificationObj);
      console.log('Notification created for receiver:', roommate.id);

      // Update dashboard stats
      const senderStatsRef = doc(db, 'dashboard-stats', user.uid);
      const senderStatsSnap = await getDoc(senderStatsRef);
      const senderStats = senderStatsSnap.exists() ? senderStatsSnap.data() : { matchRequests: 0, activeMatches: 0, messageCount: 0 };
      const receiverStatsRef = doc(db, 'dashboard-stats', roommate.id);
      const receiverStatsSnap = await getDoc(receiverStatsRef);
      const receiverStats = receiverStatsSnap.exists() ? receiverStatsSnap.data() : { matchRequests: 0, activeMatches: 0, messageCount: 0 };
      
      await setDoc(senderStatsRef, {
        ...senderStats,
        matchRequests: (senderStats.matchRequests || 0) + 1
      });
      await setDoc(receiverStatsRef, {
        ...receiverStats,
        matchRequests: (receiverStats.matchRequests || 0) + 1
      });
      setRequestSent(true);
    } catch (error) {
      console.error('Error sending match request:', error);
      alert('Failed to send match request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  // Compatibility Test logic
  const handleCompatibilityTest = async () => {
    if (!user?.uid) {
      alert('You must be logged in to check compatibility.');
      return;
    }
    setCompatLoading(true);
    try {
      // Log both user IDs
      console.log('Current user ID:', user.uid);
      console.log('Roommate ID:', roommate.id);
      
      // First try to get quiz data from subcollection
      const myQuizRef = doc(db, 'roomie-users', user.uid, 'quiz-answers', 'latest');
      const theirQuizRef = doc(db, 'roomie-users', roommate.id, 'quiz-answers', 'latest');
      const myQuizSnap = await getDoc(myQuizRef);
      const theirQuizSnap = await getDoc(theirQuizRef);

      // If not found in subcollection, try user document
      const myUserRef = doc(db, 'roomie-users', user.uid);
      const theirUserRef = doc(db, 'roomie-users', roommate.id);
      const myUserSnap = await getDoc(myUserRef);
      const theirUserSnap = await getDoc(theirUserRef);

      // Get quiz data from either location
      const myData = myQuizSnap.exists() ? myQuizSnap.data() : myUserSnap.data()?.quizAnswers;
      const theirData = theirQuizSnap.exists() ? theirQuizSnap.data() : theirUserSnap.data()?.quizAnswers;

      console.log('My quiz data:', myData);
      console.log('Their quiz data:', theirData);

      if (!myData || !theirData) {
        setCompatibility('Both users must complete the quiz.');
        setCompatLoading(false);
        return;
      }

      // Get answers from either format
      const myAnswers = myData.answers || myData;
      const theirAnswers = theirData.answers || theirData;

      // Debug output
      console.log('My answers:', myAnswers);
      console.log('Their answers:', theirAnswers);

      // Only compare keys that exist in both
      const keys = Object.keys(myAnswers).filter(key => key in theirAnswers);
      let match = 0;
      for (const key of keys) {
        if (myAnswers[key] === theirAnswers[key]) match++;
      }
      const percent = keys.length > 0 ? Math.round((match / keys.length) * 100) : 0;
      setCompatibility(percent);
    } catch (err) {
      setCompatibility('Error checking compatibility.');
      console.error(err);
    } finally {
      setCompatLoading(false);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow-md'
      } border border-gray-100`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header with Avatar and Match Score */}
      <div className="relative">
        {/* Background header color */}
        <div className="h-24 bg-gradient-to-r from-purple-600 to-pink-500" />
        
        {/* Avatar */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
            {photoURL ? (
              <Image
                src={photoURL}
                alt={name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                }}
              />
            ) : null}
            {!photoURL && (
              <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        </div>
        
        {/* Match Score */}
        {matchPercentage && (
          <div className="absolute top-4 right-4 bg-white rounded-full h-12 w-12 flex items-center justify-center shadow-md">
            <div className="text-sm font-bold text-pink-500">{matchPercentage}%</div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="pt-16 px-6 pb-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm mt-1">
            {age && <span>{age} years</span>}
            {age && gender !== 'Not specified' && <span>•</span>}
            {gender !== 'Not specified' && <span>{gender}</span>}
          </div>
          {occupation !== 'Not specified' && (
            <div className="text-gray-600 text-sm mt-1">{occupation}</div>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-3">{bio}</p>
        </div>
        
        {/* Quick Info */}
        <div className="grid grid-cols-1 gap-2 mb-6">
          <div className="bg-gray-50 p-2 rounded text-center">
            <div className="text-xs text-gray-500">Move-in</div>
            <div className="text-sm font-medium">{formattedMoveInDate}</div>
          </div>
          {roommate.hostel && (
            <div className="bg-gray-50 p-2 rounded text-center">
              <div className="text-xs text-gray-500">Hostel</div>
              <div className="text-sm font-medium">{roommate.hostel}</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button 
            onClick={handleMessageClick}
            className="flex-1 py-2 px-3 border border-pink-500 text-pink-500 hover:bg-pink-50 text-center rounded-md transition-colors text-sm font-medium"
          >
            Message
          </button>
          {!requestSent ? (
            <button
              onClick={handleMatchRequest}
              disabled={requestLoading}
              className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-md transition-colors text-sm font-medium disabled:opacity-50"
            >
              {requestLoading ? 'Sending...' : 'Request Match'}
            </button>
          ) : (
            <div className="flex-1 py-2 px-3 bg-purple-100 text-purple-700 text-center rounded-md text-sm font-medium">
              Request Sent
            </div>
          )}
          {compatibility === null ? (
            <button
              onClick={handleCompatibilityTest}
              className="flex-1 py-2 px-3 border border-purple-500 text-purple-500 hover:bg-purple-50 text-center rounded-md transition-colors text-sm font-medium"
              disabled={compatLoading}
            >
              {compatLoading ? 'Checking...' : 'Compatibility Test'}
            </button>
          ) : (
            <div className="flex-1 py-2 px-3 border border-purple-500 text-purple-700 bg-purple-50 text-center rounded-md transition-colors text-sm font-medium font-bold flex items-center justify-center">
              {typeof compatibility === 'number' ? `${compatibility}% Compatible` : compatibility}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoommateCard;