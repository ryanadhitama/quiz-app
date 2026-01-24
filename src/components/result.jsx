import React, { useState, useEffect } from 'react';

const Result = ({ score, totalQuestions, onRestart, answers, totalTimeTaken }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateScore, setAnimateScore] = useState(0);

  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  // Performance categories with blue theme
  const getPerformanceCategory = () => {
    if (percentage >= 90) return {
      category: 'Excellent!',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: '🏆',
      message: 'Outstanding performance! You\'re a quiz master!'
    };
    if (percentage >= 70) return {
      category: 'Great Job!',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: '🌟',
      message: 'Well done! You have excellent knowledge!'
    };
    if (percentage >= 50) return {
      category: 'Good Effort!',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-800',
      icon: '👍',
      message: 'Nice try! Keep learning and improving!'
    };
    return {
      category: 'Keep Practicing!',
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-100',
      textColor: 'text-sky-800',
      icon: '💪',
      message: 'Don\'t give up! Practice makes perfect!'
    };
  };

  const performance = getPerformanceCategory();

  // Animate score on mount
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = percentage / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= percentage) {
        setAnimateScore(percentage);
        clearInterval(timer);
        setShowConfetti(true);
      } else {
        setAnimateScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [percentage]);

  // Confetti particles with blue theme colors
  const confetti = showConfetti && (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ['#3B82F6', '#06B6D4', '#0EA5E9', '#22D3EE', '#6366F1'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      {confetti}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500">
        <div className="max-w-2xl w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-pulse">
              {performance.icon}
            </div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Quiz Completed!
            </h2>
            <p className="text-gray-600 text-lg">Here's how you performed</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 shadow-inner flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {Math.round(animateScore)}%
                  </div>
                  <div className="text-gray-600 text-sm mt-2">
                    {score} / {totalQuestions}
                  </div>
                </div>
              </div>
              {/* Circular progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - animateScore / 100)}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Performance Category */}
          <div className={`mb-8 p-6 rounded-xl ${performance.bgColor} border-2 border-white/50 shadow-lg transform transition-all hover:scale-105`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">{performance.icon}</span>
              <h3 className={`text-2xl font-bold ${performance.textColor}`}>
                {performance.category}
              </h3>
            </div>
            <p className={`text-center ${performance.textColor} font-medium`}>
              {performance.message}
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600 mt-1">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600 mt-1">Correct</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
              <div className="text-3xl font-bold text-red-600">{totalQuestions - score}</div>
              <div className="text-sm text-gray-600 mt-1">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600">
                {answers.length > 0 ? Math.round((totalTimeTaken / 1000) / answers.length) : 0}s
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg. Time</div>
            </div>
          </div>

          {/* Detailed Statistics */}
          {answers.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Detailed Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {score > 0 ? Math.round((totalTimeTaken / 1000) / score) : 0}s
                  </div>
                  <div className="text-xs text-gray-600">Avg. Time per Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.min(...answers.map(a => a.timeTaken / 1000))}s
                  </div>
                  <div className="text-xs text-gray-600">Fastest Answer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.max(...answers.map(a => a.timeTaken / 1000))}s
                  </div>
                  <div className="text-xs text-gray-600">Slowest Answer</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Time:</span>
                  <span className="font-semibold text-blue-600">{Math.round(totalTimeTaken / 1000)} seconds</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-semibold text-blue-600">
                    {Math.round((score / totalQuestions) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transform transition-all hover:scale-105 active:scale-95 bg-gradient-to-r ${performance.color}`}
              onClick={onRestart}
            >
              🔄 Try Again
            </button>
            <button
              className="px-8 py-4 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md transform transition-all hover:scale-105 active:scale-95"
              onClick={() => window.location.reload()}
            >
              🏠 Home
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p>Thanks for playing! Keep learning and challenging yourself. 🎯</p>
        </div>
      </div>
    </>
  );
};

export default Result;
