import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const QUESTIONS = [
  {
    id: 'teaOrCoffee',
    question: '☕️ Tea or Coffee? 🍵',
    options: [
      { value: 'tea', label: 'Tea ☕️' },
      { value: 'coffee', label: 'Coffee 🍵' }
    ]
  },
  {
    id: 'morningOrNight',
    question: '🌅 Early morning or 🌙 Late night?',
    options: [
      { value: 'early', label: 'Early morning 🌅' },
      { value: 'late', label: 'Late night 🌙' }
    ]
  },
  {
    id: 'netflixOrYoutube',
    question: '📺 Netflix or 📹 YouTube?',
    options: [
      { value: 'netflix', label: 'Netflix 📺' },
      { value: 'youtube', label: 'YouTube 📹' }
    ]
  },
  {
    id: 'cleanOrChill',
    question: '🧹 Clean freak or 😎 Chill with mess?',
    options: [
      { value: 'clean', label: 'Clean freak 🧹' },
      { value: 'chill', label: 'Chill with mess 😎' }
    ]
  },
  {
    id: 'silenceOrMusic',
    question: '🤫 Study in silence or 🎶 Study with music?',
    options: [
      { value: 'silence', label: 'Silence 🤫' },
      { value: 'music', label: 'Music 🎶' }
    ]
  },
  {
    id: 'acOrFan',
    question: '❄️ AC on blast or 🌬️ Fan is enough?',
    options: [
      { value: 'ac', label: 'AC on blast ❄️' },
      { value: 'fan', label: 'Fan is enough 🌬️' }
    ]
  },
  {
    id: 'homeOrMess',
    question: '🏠 Home food or 🏢 Hostel mess food?',
    options: [
      { value: 'home', label: 'Home food 🏠' },
      { value: 'mess', label: 'Hostel mess food 🏢' }
    ]
  },
  {
    id: 'talkativeOrQuiet',
    question: '🗣️ Talkative roommate or 🤫 Quiet one?',
    options: [
      { value: 'talkative', label: 'Talkative 🗣️' },
      { value: 'quiet', label: 'Quiet 🤫' }
    ]
  },
  {
    id: 'partyOrRelax',
    question: '🎉 Party weekends or 🛌 Relaxing weekends?',
    options: [
      { value: 'party', label: 'Party weekends 🎉' },
      { value: 'relax', label: 'Relaxing weekends 🛌' }
    ]
  },
  {
    id: 'decoratedOrSimple',
    question: '🖼️ Decorated room or 🛏️ Simple room?',
    options: [
      { value: 'decorated', label: 'Decorated 🖼️' },
      { value: 'simple', label: 'Simple 🛏️' }
    ]
  }
];

export default function ThisOrThatQuizComponent({ onComplete }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const q = QUESTIONS[current];

  const handleSelect = (value) => {
    setAnswers({ ...answers, [q.id]: value });
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent(current + 1);
      } else {
        handleSubmit({ ...answers, [q.id]: value });
      }
    }, 250);
  };

  const handleSubmit = async (finalAnswers) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'roomie-users', user.uid), {
        thisOrThat: finalAnswers,
        thisOrThatCompleted: true,
        thisOrThatCompletedAt: new Date()
      }, { merge: true });
      setDone(true);
      if (onComplete) onComplete();
    } catch (e) {
      alert('Failed to save your answers. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-900 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 Thanks for playing This or That!</h2>
        <p className="text-pink-300">You can now find your most compatible roommates!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900 text-white rounded-lg shadow-lg p-8 w-full max-w-lg mx-auto">
      <div className="w-full mb-6">
        <div className="text-sm text-pink-400 mb-2 font-bold">
          Question {current + 1} of {QUESTIONS.length}
        </div>
        <h2 className="text-2xl font-semibold mb-6 text-center">{q.question}</h2>
        <div className="flex flex-col gap-4">
          {q.options.map(opt => (
            <button
              key={opt.value}
              className={`w-full py-3 px-4 rounded-xl border-2 text-lg font-semibold transition-colors
                ${answers[q.id] === opt.value
                  ? 'bg-pink-600 border-pink-400 text-white scale-105 shadow-lg'
                  : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-pink-800 hover:border-pink-400'}
              `}
              onClick={() => handleSelect(opt.value)}
              disabled={saving}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full flex justify-center mt-6">
        <div className="h-2 rounded-full bg-gray-700 w-3/4">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all"
            style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}
          ></div>
        </div>
      </div>
      {saving && <div className="mt-4 text-pink-300">Saving your answers...</div>}
    </div>
  );
} 