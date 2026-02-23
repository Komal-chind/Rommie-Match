import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuiz } from '../../hooks/useQuiz';

const QuizComponent = () => {
  const { quizQuestions, submitQuiz, loading, error } = useQuiz();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSelect = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

  const handleNext = () => {
    if (!answers[quizQuestions[current].id]) return;
    setCurrent(current + 1);
  };

  const handleSubmit = async () => {
    if (!answers[quizQuestions[current].id]) return;
    try {
      await submitQuiz(answers);
      setSubmitted(true);
      setTimeout(() => router.push('/roommates'), 2000);
    } catch (e) {
      // error handled in hook
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-900 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Thank you for completing the quiz!</h2>
        <p>Redirecting to find roommates...</p>
      </div>
    );
  }

  const q = quizQuestions[current];
  const isLast = current === quizQuestions.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900 text-white rounded-lg shadow-lg p-8 w-full max-w-lg mx-auto">
      <div className="w-full mb-6">
        <div className="text-sm text-purple-400 mb-2">
          Question {current + 1} of {quizQuestions.length}
        </div>
        <h2 className="text-xl font-semibold mb-4">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map(opt => (
            <button
              key={opt.value}
              className={`w-full py-2 px-4 rounded-lg border transition-colors
                ${answers[q.id] === opt.value
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-purple-800'}
              `}
              onClick={() => handleSelect(q.id, opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between w-full mt-6">
        <button
          className="px-4 py-2 rounded bg-gray-700 text-gray-300 disabled:opacity-50"
          onClick={() => setCurrent(current - 1)}
          disabled={current === 0}
        >
          Back
        </button>
        {isLast ? (
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!answers[q.id] || loading}
          >
            Submit
          </button>
        ) : (
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
            onClick={handleNext}
            disabled={!answers[q.id] || loading}
          >
            Next
          </button>
        )}
      </div>
      {loading && <div className="mt-4 text-purple-300">Saving your answers...</div>}
      {error && <div className="mt-4 text-red-400">{error}</div>}
    </div>
  );
};

export default QuizComponent;