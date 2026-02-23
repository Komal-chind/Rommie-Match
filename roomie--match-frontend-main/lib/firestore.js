import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';

// Real-time dashboard stats
export const subscribeToDashboardStats = (userId, callback) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, async (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      
      // Get active matches count
      const matchesQuery = query(
        collection(db, 'matches'),
        where('participants', 'array-contains', userId),
        where('status', '==', 'active')
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const activeMatches = matchesSnapshot.size;

      // Get unread messages count
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const messageCount = messagesSnapshot.size;

      // Get profile views
      const viewsQuery = query(
        collection(db, 'profile-views'),
        where('viewedUserId', '==', userId),
        where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      );
      
      const viewsSnapshot = await getDocs(viewsQuery);
      const profileViews = viewsSnapshot.size;

      // Get pending match requests
      const requestsQuery = query(
        collection(db, 'match-requests'),
        where('recipientId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const matchRequests = requestsSnapshot.size;

      callback({
        activeMatches,
        messageCount,
        profileViews,
        matchRequests
      });
    }
  });
};

// Real-time compatibility data
export const subscribeToCompatibility = (userId, callback) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, async (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      
      // Get quiz answers
      const quizAnswers = userData.quizAnswers || {};
      
      // Calculate compatibility scores based on quiz answers
      const compatibility = {
        lifestyle: calculateLifestyleScore(quizAnswers),
        cleanliness: calculateCleanlinessScore(quizAnswers),
        schedule: calculateScheduleScore(quizAnswers),
        social: calculateSocialScore(quizAnswers),
        values: calculateValuesScore(quizAnswers)
      };

      callback(compatibility);
    }
  });
};

// Real-time recent activity
export const subscribeToRecentActivity = (userId, callback) => {
  const activityQuery = query(
    collection(db, 'user-activity'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(10)
  );

  return onSnapshot(activityQuery, (snapshot) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    callback(activities);
  });
};

// Real-time mood updates
export const subscribeToMood = (userId, callback) => {
  const moodQuery = query(
    collection(db, 'moods'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(1)
  );

  return onSnapshot(moodQuery, (snapshot) => {
    if (!snapshot.empty) {
      const moodData = snapshot.docs[0].data();
      callback(moodData);
    }
  });
};

// Update user's mood
export const updateUserMood = async (userId, mood) => {
  const moodRef = collection(db, 'moods');
  await addDoc(moodRef, {
    userId,
    mood,
    timestamp: serverTimestamp()
  });

  // Update user's current mood
  const userRef = doc(db, 'roomie-users', userId);
  await updateDoc(userRef, {
    currentMood: mood,
    lastMoodUpdate: serverTimestamp()
  });
};

// Helper functions for compatibility calculations
const calculateLifestyleScore = (answers) => {
  // Implement lifestyle compatibility calculation
  return Math.floor(Math.random() * 40) + 60; // Placeholder
};

const calculateCleanlinessScore = (answers) => {
  // Implement cleanliness compatibility calculation
  return Math.floor(Math.random() * 40) + 60; // Placeholder
};

const calculateScheduleScore = (answers) => {
  // Implement schedule compatibility calculation
  return Math.floor(Math.random() * 40) + 60; // Placeholder
};

const calculateSocialScore = (answers) => {
  // Implement social compatibility calculation
  return Math.floor(Math.random() * 40) + 60; // Placeholder
};

const calculateValuesScore = (answers) => {
  // Implement values compatibility calculation
  return Math.floor(Math.random() * 40) + 60; // Placeholder
};

// Save quiz answers
export const saveQuizAnswers = async (userId, answers) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    quizAnswers: answers,
    quizCompleted: true,
    lastQuizUpdate: serverTimestamp()
  });

  // Add activity record
  const activityRef = collection(db, 'user-activity');
  await addDoc(activityRef, {
    userId,
    type: 'quiz_completed',
    description: 'Completed roommate compatibility quiz',
    timestamp: serverTimestamp()
  });
};

// Get potential matches
export const getPotentialMatches = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return [];

  const userData = userDoc.data();
  const userAnswers = userData.quizAnswers || {};

  // Query for potential matches
  const matchesQuery = query(
    collection(db, 'users'),
    where('quizCompleted', '==', true),
    where('uid', '!=', userId),
    limit(10)
  );

  const matchesSnapshot = await getDocs(matchesQuery);
  return matchesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    compatibility: calculateOverallCompatibility(userAnswers, doc.data().quizAnswers)
  }));
};

// Calculate overall compatibility between two users
const calculateOverallCompatibility = (user1Answers, user2Answers) => {
  // Implement compatibility calculation logic
  return Math.floor(Math.random() * 40) + 60; // Placeholder
}; 