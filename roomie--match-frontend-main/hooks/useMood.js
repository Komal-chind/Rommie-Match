import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { recordMood, getUserMoods } from '../lib/firebase';

export const useMood = () => {
  const { currentUser } = useAuth();
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available mood options
  const moodOptions = [
    { value: 'great', label: 'Great', emoji: '😄' },
    { value: 'good', label: 'Good', emoji: '🙂' },
    { value: 'okay', label: 'Okay', emoji: '😐' },
    { value: 'tired', label: 'Tired', emoji: '😴' },
    { value: 'stressed', label: 'Stressed', emoji: '😰' },
    { value: 'sad', label: 'Sad', emoji: '😢' }
  ];

  // Fetch user's recent moods
  useEffect(() => {
    if (!currentUser) {
      setMoods([]);
      return;
    }

    const fetchMoods = async () => {
      try {
        setLoading(true);
        const userMoods = await getUserMoods(currentUser.uid);
        setMoods(userMoods);
      } catch (err) {
        console.error('Error fetching moods:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, [currentUser]);

  // Record a new mood
  const addMood = async (mood, note = '') => {
    if (!currentUser) {
      throw new Error('You must be logged in to record a mood');
    }

    try {
      setLoading(true);
      
      const moodData = {
        mood,
        note,
        timestamp: new Date()
      };
      
      await recordMood(currentUser.uid, moodData);
      
      // Update local mood list
      setMoods(prevMoods => [
        { id: Date.now().toString(), ...moodData },
        ...prevMoods
      ]);
      
      return true;
    } catch (err) {
      console.error('Error recording mood:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    moods,
    moodOptions,
    loading,
    error,
    addMood
  };
};