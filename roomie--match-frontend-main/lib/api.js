// lib/api.js
import {
  auth,
  db,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  saveQuizResults,
  findMatches,
  createChat,
  sendMessage,
  getChatMessages,
  getUserChats,
  recordMood,
  getUserMoods
} from './firebase';

/**
 * Authentication API functions
 */
export const authAPI = {
  // Login with email and password
  login: async (email, password) => {
    try {
      const userCredential = await loginWithEmail(email, password);
      return {
        user: userCredential.user,
        success: true
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register a new user
  register: async (email, password, userData) => {
    try {
      const userCredential = await registerWithEmail(email, password, userData);
      return {
        user: userCredential.user,
        success: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Sign out the current user
  logout: async () => {
    try {
      await logoutUser();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get the current authenticated user
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

/**
 * User API functions
 */
export const userAPI = {
  // Get user profile by ID
  getProfile: async (userId) => {
    try {
      return await getUserProfile(userId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      return await updateUserProfile(userId, userData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};

/**
 * Roommate matching API functions
 */
export const matchingAPI = {
  // Save quiz results for a user
  saveQuiz: async (userId, quizData) => {
    try {
      return await saveQuizResults(userId, quizData);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      throw error;
    }
  },

  // Find potential roommate matches
  findMatches: async (userId) => {
    try {
      return await findMatches(userId);
    } catch (error) {
      console.error('Error finding matches:', error);
      throw error;
    }
  }
};

/**
 * Chat API functions
 */
export const chatAPI = {
  // Create a new chat between two users
  createChat: async (userId, otherUserId) => {
    try {
      return await createChat(userId, otherUserId);
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Send a message in a chat
  sendMessage: async (chatId, message) => {
    try {
      return await sendMessage(chatId, message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get messages from a chat
  getMessages: async (chatId) => {
    try {
      return await getChatMessages(chatId);
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  },

  // Get all chats for a user
  getUserChats: async (userId) => {
    try {
      return await getUserChats(userId);
    } catch (error) {
      console.error('Error getting user chats:', error);
      throw error;
    }
  }
};

/**
 * Mood tracking API functions
 */
export const moodAPI = {
  // Record a user's mood
  recordMood: async (userId, moodData) => {
    try {
      return await recordMood(userId, moodData);
    } catch (error) {
      console.error('Error recording mood:', error);
      throw error;
    }
  },

  // Get a user's mood history
  getMoodHistory: async (userId, limit = 7) => {
    try {
      return await getUserMoods(userId, limit);
    } catch (error) {
      console.error('Error getting mood history:', error);
      throw error;
    }
  }
};

// Export a default API client that combines all API functions
const apiClient = {
  auth: authAPI,
  user: userAPI,
  matching: matchingAPI,
  chat: chatAPI,
  mood: moodAPI
};

export default apiClient;