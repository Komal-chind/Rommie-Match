import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useQuiz = () => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizQuestions = async () => {
      try {
        const questionsRef = collection(db, 'quizQuestions');
        const snapshot = await getDocs(questionsRef);
        const questions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuizQuestions(questions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz questions');
        setLoading(false);
        console.error('Error fetching quiz questions:', err);
      }
    };

    fetchQuizQuestions();
  }, []);

  const submitQuiz = async (answers) => {
    try {
      const quizSubmissionsRef = collection(db, 'quizSubmissions');
      const submissionData = {
        answers,
        timestamp: new Date(),
      };
      
      const docRef = await addDoc(quizSubmissionsRef, submissionData);
      return { id: docRef.id, ...submissionData };
    } catch (err) {
      console.error('Error submitting quiz:', err);
      throw new Error('Failed to submit quiz');
    }
  };

  return {
    quizQuestions,
    submitQuiz,
    loading,
    error
  };
}; 