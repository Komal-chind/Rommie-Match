// // lib/firebase.js
// // import { initializeApp, getApps } from 'firebase/app';
// // import { getAuth, connectAuthEmulator } from 'firebase/auth';
// // import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// // import { getDatabase, connectDatabaseEmulator } from 'firebase/database';


// //---------new--------------------//
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
// import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "AIzaSyB0tW9q1mOLcG6T38esce4Dn-SxStSQV8s",
//   authDomain: "roomie-match-01.firebaseapp.com",
//   projectId: "roomie-match-01",
//   storageBucket: "roomie-match-01.firebasestorage.app",
//   messagingSenderId: "926512031667",
//   appId: "1:926512031667:web:d7bd0e1a3025ce9eb7cdc6",
//   measurementId: "G-4K5Z9CJWBE",
//   databaseURL: "https://roomie-match-01.firebaseio.com" // Added databaseURL
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize services
// const auth = getAuth(app);
// const db = getFirestore(app);

// // Auth functions
// export const loginWithEmail = (email, password) => {
//   return signInWithEmailAndPassword(auth, email, password);
// };

// export const registerWithEmail = async (email, password, userData) => {
//   // Create user in Firebase Auth
//   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
//   // Add user data to Firestore
//   await setDoc(doc(db, 'roomie-users', userCredential.user.uid), {
//     name: userData.name,
//     email: userData.email,
//     gender: userData.gender || null,
//     'phone-number': userData.phoneNumber || null,
//     preferences: userData.preferences || {},
//     createdAt: new Date()
//   });
  
//   return userCredential;
// };

// export const logoutUser = () => {
//   return signOut(auth);
// };

// // User functions
// export const getUserProfile = async (userId) => {
//   const docRef = doc(db, 'roomie-users', userId);
//   const docSnap = await getDoc(docRef);
  
//   if (docSnap.exists()) {
//     return { id: docSnap.id, ...docSnap.data() };
//   } else {
//     throw new Error('User not found');
//   }
// };

// export const updateUserProfile = async (userId, userData) => {
//   const userRef = doc(db, 'roomie-users', userId);
//   await updateDoc(userRef, {
//     ...userData,
//     updatedAt: new Date()
//   });
  
//   return { success: true };
// };

// // Quiz functions
// export const saveQuizResults = async (userId, quizData) => {
//   const userRef = doc(db, 'roomie-users', userId);
//   await updateDoc(userRef, {
//     'preferences.quiz': quizData,
//     'preferences.quizCompletedAt': new Date()
//   });
  
//   return { success: true };  
// };

// // Find potential roommate matches based on quiz answers
// export const findMatches = async (userId) => {
//   // Get current user's quiz data
//   const userRef = doc(db, 'roomie-users', userId);
//   const userSnap = await getDoc(userRef);
  
//   if (!userSnap.exists() || !userSnap.data().preferences?.quiz) {
//     throw new Error('User has not completed the compatibility quiz');
//   }
  
//   const userData = userSnap.data();
  
//   // Get all users who have completed the quiz
//   const usersRef = collection(db, 'roomie-users');
//   const q = query(usersRef, where('preferences.quizCompletedAt', '!=', null));
//   const querySnapshot = await getDocs(q);
  
//   // Calculate compatibility scores
//   const matches = [];
//   querySnapshot.forEach((doc) => {
//     if (doc.id !== userId) {
//       const potentialMatch = doc.data();
      
//       // Calculate compatibility score
//       const compatibilityScore = calculateCompatibility(
//         userData.preferences.quiz,
//         potentialMatch.preferences?.quiz || {}
//       );
      
//       if (compatibilityScore > 0) {
//         matches.push({
//           userId: doc.id,
//           name: potentialMatch.name,
//           compatibility: compatibilityScore,
//           gender: potentialMatch.gender
//         });
//       }
//     }
//   });
  
//   // Sort by compatibility score (highest first)
//   return matches.sort((a, b) => b.compatibility - a.compatibility);
// };

// // Helper function to calculate compatibility between two users
// function calculateCompatibility(userQuiz, matchQuiz) {
//   if (!userQuiz || !matchQuiz) return 0;
  
//   let score = 0;
//   let totalQuestions = 0;
  
//   for (const question in userQuiz) {
//     if (matchQuiz[question]) {
//       totalQuestions++;
//       if (userQuiz[question] === matchQuiz[question]) {
//         score++;
//       }
//     }
//   }
  
//   return totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
// }

// // Chat functions
// export const createChat = async (userId, otherUserId) => {
//   // Check if chat already exists
//   const chatsRef = collection(db, 'chats');
//   const q = query(
//     chatsRef, 
//     where('participants', 'array-contains', userId)
//   );
  
//   const querySnapshot = await getDocs(q);
//   let existingChat = null;
  
//   querySnapshot.forEach((doc) => {
//     const chatData = doc.data();
//     if (chatData.participants.includes(otherUserId)) {
//       existingChat = { id: doc.id, ...chatData };
//     }
//   });
  
//   if (existingChat) {
//     return { chatId: existingChat.id };
//   }
  
//   // Create new chat
//   const chatRef = await addDoc(collection(db, 'chats'), {
//     participants: [userId, otherUserId],
//     createdAt: new Date(),
//     lastMessage: null,
//     lastMessageAt: null
//   });
  
//   return { chatId: chatRef.id };
// };

// export const sendMessage = async (chatId, message) => {
//   const chatRef = doc(db, 'chats', chatId);
//   const messageData = {
//     ...message,
//     createdAt: new Date()
//   };
  
//   // Add message to chat
//   const messageRef = await addDoc(
//     collection(db, 'chats', chatId, 'messages'),
//     messageData
//   );
  
//   // Update last message in chat
//   await updateDoc(chatRef, {
//     lastMessage: message.text,
//     lastMessageAt: new Date(),
//     [`lastMessageRead.${message.senderId}`]: true,
//     [`lastMessageRead.${message.receiverId}`]: false
//   });
  
//   return { messageId: messageRef.id };
// };

// export const getChatMessages = async (chatId) => {
//   const messagesRef = collection(db, 'chats', chatId, 'messages');
//   const q = query(messagesRef, orderBy('createdAt', 'asc'));
//   const querySnapshot = await getDocs(q);
  
//   const messages = [];
//   querySnapshot.forEach((doc) => {
//     messages.push({ id: doc.id, ...doc.data() });
//   });
  
//   return messages;
// };

// export const getUserChats = async (userId) => {
//   const chatsRef = collection(db, 'chats');
//   const q = query(
//     chatsRef,
//     where('participants', 'array-contains', userId),
//     orderBy('lastMessageAt', 'desc')
//   );
  
//   const querySnapshot = await getDocs(q);
  
//   const chats = [];
//   for (const doc of querySnapshot.docs) {
//     const chatData = doc.data();
    
//     // Get other participant details
//     const otherUserId = chatData.participants.find(id => id !== userId);
//     const otherUserDoc = await getDoc(doc(db, 'roomie-users', otherUserId));
    
//     chats.push({
//       id: doc.id,
//       otherUser: {
//         id: otherUserId,
//         name: otherUserDoc.exists() ? otherUserDoc.data().name : 'Unknown User'
//       },
//       lastMessage: chatData.lastMessage,
//       lastMessageAt: chatData.lastMessageAt,
//       unread: chatData.lastMessageRead ? !chatData.lastMessageRead[userId] : false
//     });
//   }
  
//   return chats;
// };

// // Mood tracking functions
// export const recordMood = async (userId, moodData) => {
//   await addDoc(
//     collection(db, 'roomie-users', userId, 'moods'),
//     {
//       ...moodData,
//       createdAt: new Date()
//     }
//   );
  
//   return { success: true };
// };

// export const getUserMoods = async (userId, limitCount = 7) => {
//   const moodsRef = collection(db, 'roomie-users', userId, 'moods');
//   const q = query(
//     moodsRef,
//     orderBy('createdAt', 'desc'),
//     limit(limitCount)
//   );
  
//   const querySnapshot = await getDocs(q);
  
//   const moods = [];
//   querySnapshot.forEach((doc) => {
//     moods.push({ id: doc.id, ...doc.data() });
//   });
  
//   return moods;
// };


// export { auth, db };



import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { app } from './firebaseConfig';

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const registerWithEmail = async (email, password, userData) => {
  try {
    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Prepare user data for Firestore
    const userDataToSave = {
      name: userData?.name || '',
      email: email, // Use the email from auth
      gender: userData?.gender || null,
      phoneNumber: userData?.phoneNumber || null,
      preferences: userData?.preferences || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add user data to Firestore
    await setDoc(doc(db, 'roomie-users', userCredential.user.uid), userDataToSave);
    
    return userCredential;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logoutUser = () => {
  return signOut(auth);
};

// User functions
export const getUserProfile = async (userId) => {
  const docRef = doc(db, 'roomie-users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('User not found');
  }
};

export const getAllUsers = async () => {
  const usersRef = collection(db, 'roomie-users');
  const q = query(usersRef);
  const querySnapshot = await getDocs(q);
  
  const users = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  
  return users;
};

export const updateUserProfile = async (userId, userData) => {
  const userRef = doc(db, 'roomie-users', userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: new Date()
  });
  
  return { success: true };
};

// Quiz functions
export const saveQuizResults = async (userId, quizData) => {
  const quizRef = doc(db, 'roomie-users', userId, 'quiz-answers', 'latest');
  await setDoc(quizRef, {
    answers: quizData,
    completedAt: serverTimestamp()
  });
  return { success: true };  
};

// Find potential roommate matches based on quiz answers
export const findMatches = async (userId) => {
  // Get current user's quiz data
  const userRef = doc(db, 'roomie-users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists() || !userSnap.data().preferences?.quiz) {
    throw new Error('User has not completed the compatibility quiz');
  }
  
  const userData = userSnap.data();
  
  // Get all users who have completed the quiz
  const usersRef = collection(db, 'roomie-users');
  const q = query(usersRef, where('preferences.quizCompletedAt', '!=', null));
  const querySnapshot = await getDocs(q);
  
  // Calculate compatibility scores
  const matches = [];
  querySnapshot.forEach((doc) => {
    if (doc.id !== userId) {
      const potentialMatch = doc.data();
      
      // Calculate compatibility score
      const compatibilityScore = calculateCompatibility(
        userData.preferences.quiz,
        potentialMatch.preferences?.quiz || {}
      );
      
      if (compatibilityScore > 0) {
        matches.push({
          userId: doc.id,
          name: potentialMatch.name,
          compatibility: compatibilityScore,
          gender: potentialMatch.gender
        });
      }
    }
  });
  
  // Sort by compatibility score (highest first)
  return matches.sort((a, b) => b.compatibility - a.compatibility);
};

// Helper function to calculate compatibility between two users
function calculateCompatibility(userQuiz, matchQuiz) {
  if (!userQuiz || !matchQuiz) return 0;
  
  let score = 0;
  let totalQuestions = 0;
  
  for (const question in userQuiz) {
    if (matchQuiz[question]) {
      totalQuestions++;
      if (userQuiz[question] === matchQuiz[question]) {
        score++;
      }
    }
  }
  
  return totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
}

// Chat functions
export const createChat = async (userId, otherUserId) => {
  // Check if chat already exists
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef, 
    where('participants', 'array-contains', userId)
  );
  
  const querySnapshot = await getDocs(q);
  let existingChat = null;
  
  querySnapshot.forEach((doc) => {
    const chatData = doc.data();
    if (chatData.participants.includes(otherUserId)) {
      existingChat = { id: doc.id, ...chatData };
    }
  });
  
  if (existingChat) {
    return { chatId: existingChat.id };
  }
  
  // Create new chat
  const chatRef = await addDoc(collection(db, 'chats'), {
    participants: [userId, otherUserId],
    createdAt: new Date(),
    lastMessage: null,
    lastMessageAt: null
  });
  
  return { chatId: chatRef.id };
};

export const sendMessage = async (chatId, message) => {
  const chatRef = doc(db, 'chats', chatId);
  const messageData = {
    ...message,
    createdAt: new Date()
  };
  
  // Add message to chat
  const messageRef = await addDoc(
    collection(db, 'chats', chatId, 'messages'),
    messageData
  );
  
  // Update last message in chat
  await updateDoc(chatRef, {
    lastMessage: message.text,
    lastMessageAt: new Date(),
    [`lastMessageRead.${message.senderId}`]: true,
    [`lastMessageRead.${message.receiverId}`]: false
  });
  
  return { messageId: messageRef.id };
};

export const getChatMessages = async (chatId) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);
  
  const messages = [];
  querySnapshot.forEach((doc) => {
    messages.push({ id: doc.id, ...doc.data() });
  });
  
  return messages;
};

export const getUserChats = async (userId) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  const chats = [];
  for (const doc of querySnapshot.docs) {
    const chatData = doc.data();
    
    // Get other participant details
    const otherUserId = chatData.participants.find(id => id !== userId);
    const otherUserDoc = await getDoc(doc(db, 'roomie-users', otherUserId));
    
    chats.push({
      id: doc.id,
      otherUser: {
        id: otherUserId,
        name: otherUserDoc.exists() ? otherUserDoc.data().name : 'Unknown User'
      },
      lastMessage: chatData.lastMessage,
      lastMessageAt: chatData.lastMessageAt,
      unread: chatData.lastMessageRead ? !chatData.lastMessageRead[userId] : false
    });
  }
  
  return chats;
};

// Mood tracking functions
export const recordMood = async (userId, moodData) => {
  await addDoc(
    collection(db, 'roomie-users', userId, 'moods'),
    {
      ...moodData,
      createdAt: new Date()
    }
  );
  
  return { success: true };
};

export const getUserMoods = async (userId, limitCount = 7) => {
  const moodsRef = collection(db, 'roomie-users', userId, 'moods');
  const q = query(
    moodsRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  
  const moods = [];
  querySnapshot.forEach((doc) => {
    moods.push({ id: doc.id, ...doc.data() });
  });
  
  return moods;
};


export { auth, db };