import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { findMatches } from '../lib/firebase';

export const useQuiz = () => {
  const { user } = useAuth();
  const [quizResults, setQuizResults] = useState({});
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Updated quiz questions
  const quizQuestions = [
    {
      id: 'department',
      question: 'Department',
      options: [
        { value: 'ece', label: 'ECE' },
        { value: 'coe', label: 'COE' },
        { value: 'cse', label: 'CSE' },
        { value: 'copc', label: 'COPC' },
        { value: 'ee', label: 'EE' }
      ]
    },
    {
      id: 'graduatingYear',
      question: 'Graduating year',
      options: [
        { value: '2024', label: '2024' },
        { value: '2025', label: '2025' },
        { value: '2026', label: '2026' },
        { value: '2027', label: '2027' },
        { value: '2028', label: '2028' }
      ]
    },
    {
      id: 'city',
      question: 'City',
      options: [
        { value: 'delhi', label: 'Delhi' },
        { value: 'mumbai', label: 'Mumbai' },
        { value: 'bangalore', label: 'Bangalore' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'dietaryRestrictions',
      question: 'Do you have any religious or cultural dietary restrictions?',
      options: [
        { value: 'yes', label: 'Yes (e.g., vegetarian only, halal, etc.)' },
        { value: 'no', label: 'No' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ]
    },
    {
      id: 'comfortableWithDifferentBelief',
      question: 'Are you comfortable with a roommate who follows a different religion or belief system?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ]
    },
    {
      id: 'comfortableWithGuests',
      question: 'Are you comfortable with guests or friends visiting often?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'sometimes', label: 'Sometimes' }
      ]
    },
    {
      id: 'socializeFrequency',
      question: 'How often do you like to socialize?',
      options: [
        { value: 'very_often', label: 'Very often' },
        { value: 'sometimes', label: 'Sometimes' },
        { value: 'rarely', label: 'Rarely' }
      ]
    },
    {
      id: 'vegOrNonveg',
      question: 'Are you vegetarian or non-vegetarian?',
      options: [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'non_vegetarian', label: 'Non-vegetarian' },
        { value: 'doesnt_matter', label: "Doesn't matter" }
      ]
    },
    {
      id: 'roomEnvironment',
      question: 'How do you prefer your room environment?',
      options: [
        { value: 'quiet', label: 'Quiet and focused' },
        { value: 'chill', label: 'Chill and casual' },
        { value: 'doesnt_matter', label: "Doesn't matter" }
      ]
    },
    {
      id: 'lightsPreference',
      question: 'Do you prefer keeping the lights on or off while sleeping?',
      options: [
        { value: 'off', label: 'Off' },
        { value: 'dim', label: 'Dim light' },
        { value: 'doesnt_matter', label: "Doesn't matter" }
      ]
    }
  ];

  // Save quiz answers and find matches
  const submitQuiz = async (answers) => {
    if (!user) {
      throw new Error('You must be logged in to submit the quiz');
    }

    try {
      setLoading(true);
      
      // Save quiz results to Firestore
      const userRef = doc(db, 'roomie-users', user.uid);
      await setDoc(userRef, {
        quizAnswers: answers,
        quizCompleted: true,
        quizCompletedAt: new Date()
      }, { merge: true });

      setQuizResults(answers);
      
      // Find potential matches
      const potentialMatches = await findMatches(user.uid);
      setMatches(potentialMatches);
      
      return potentialMatches;
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Find matches based on quiz answers
  const findMatches = async (userId) => {
    try {
      // Get current user's quiz data
      const userRef = doc(db, 'roomie-users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      
      if (!userData.quizAnswers) {
        throw new Error('Quiz answers not found');
      }

      // Get all users who have completed the quiz
      const usersRef = collection(db, 'roomie-users');
      const q = query(
        usersRef,
        where('quizCompleted', '==', true),
        where('uid', '!=', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const matches = [];
      
      querySnapshot.forEach((doc) => {
        const potentialMatch = doc.data();
        if (potentialMatch.quizAnswers) {
          const compatibilityScore = calculateCompatibility(
            userData.quizAnswers,
            potentialMatch.quizAnswers
          );
          
          matches.push({
            userId: doc.id,
            name: potentialMatch.name || 'Anonymous',
            compatibility: compatibilityScore,
            gender: potentialMatch.gender
          });
        }
      });
      
      return matches.sort((a, b) => b.compatibility - a.compatibility);
    } catch (err) {
      console.error('Error finding matches:', err);
      throw err;
    }
  };

  // Helper function to calculate compatibility between two users
  const calculateCompatibility = (user1Answers, user2Answers) => {
    if (!user1Answers || !user2Answers) return 0;
    
    let score = 0;
    let totalQuestions = 0;
    
    for (const question in user1Answers) {
      if (user2Answers[question]) {
        totalQuestions++;
        if (user1Answers[question] === user2Answers[question]) {
          score++;
        }
      }
    }
    
    return totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  };

  return {
    quizQuestions,
    quizResults,
    matches,
    loading,
    error,
    submitQuiz
  };
};