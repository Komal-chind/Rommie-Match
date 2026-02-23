
export default function QuizQuestion({ question, selectedValue, onAnswer }) {
    if (!question) return null;
  
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{question.question}</h3>
        
        <div className="mt-4 space-y-3">
          {question.options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`option-${option.value}`}
                name={`question-${question.id}`}
                type="radio"
                value={option.value}
                checked={selectedValue === option.value}
                onChange={() => onAnswer(option.value)}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor={`option-${option.value}`} className="ml-3 block text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }