import { useEffect, useState } from "react";
import { shuffleArray } from "@/utils/array";
import { formattedQuestion } from "@/utils/string";

const Question = ({ questionData, handleAnswer, currentScore }) => {
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Shuffle answers when the question data changes
  useEffect(() => {
    if (questionData) {
      const answers = [
        ...questionData.incorrect_answers,
        questionData.correct_answer,
      ];
      setShuffledAnswers(shuffleArray(answers));
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  }, [questionData]);

  const handleAnswerClick = (answer) => {
    if (showFeedback) return; // Prevent multiple clicks
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    // Allow time for user to see feedback before moving to next question
    setTimeout(() => {
      handleAnswer(answer);
    }, 1500);
  };

  const isCorrectAnswer = (answer) => answer === questionData?.correct_answer;
  const isIncorrectSelected = selectedAnswer && selectedAnswer === selectedAnswer && !isCorrectAnswer(selectedAnswer);
  
  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border-l-4 border-blue-500 shadow-md">
        <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
          {formattedQuestion(questionData?.question)}
        </h2>
      </div>

      {/* Answer buttons grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuffledAnswers.map((answer, index) => {
          const isSelected = selectedAnswer === answer;
          const isCorrect = isCorrectAnswer(answer);
          
          let buttonStyle = "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50";
          
          if (showFeedback) {
            if (isSelected && isCorrect) {
              buttonStyle = "bg-green-500 border-green-600 text-white transform scale-105 shadow-lg";
            } else if (isSelected && !isCorrect) {
              buttonStyle = "bg-red-500 border-red-600 text-white transform scale-95 shadow-lg";
            } else if (!isSelected && isCorrect) {
              buttonStyle = "bg-green-100 border-green-300 text-green-800 border-2 border-dashed";
            } else {
              buttonStyle = "bg-gray-100 border-gray-200 text-gray-400";
            }
          }

          return (
            <button
              key={index}
              className={`relative overflow-hidden p-4 rounded-xl font-semibold text-left transition-all duration-300 ${buttonStyle} ${
                showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
              }`}
              onClick={() => handleAnswerClick(answer)}
              disabled={showFeedback}
            >
              <span className="relative z-10 flex items-center">
                {!showFeedback && (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3 text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                )}
                {showFeedback && isCorrectAnswer(answer) && (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-bold mr-3 text-lg">
                    ✓
                  </span>
                )}
                {showFeedback && !isCorrectAnswer(answer) && isSelected && (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-bold mr-3 text-lg">
                    ✗
                  </span>
                )}
                {answer}
              </span>
              {showFeedback && isCorrect && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-20"></div>
              )}
              {showFeedback && isSelected && !isCorrect && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 opacity-20"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback message */}
      {showFeedback && (
        <div className={`p-4 rounded-xl font-semibold text-center transform transition-all duration-300 ${
          isCorrectAnswer(selectedAnswer) 
            ? 'bg-green-100 text-green-800 border-2 border-green-300' 
            : 'bg-red-100 text-red-800 border-2 border-red-300'
        }`}>
          {isCorrectAnswer(selectedAnswer) ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🎉</span>
              <span>Correct! Great job!</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">😢</span>
              <span>Incorrect! The correct answer is: <strong>{questionData.correct_answer}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Score display */}
      {!showFeedback && (
        <div className="text-center text-sm text-gray-500 font-medium">
          Select your answer above
        </div>
      )}
    </div>
  );
};

export default Question;