import { useState, useEffect } from "react";
import Question from "../components/question";
import Result from "../components/result";
import Head from "next/head";
import { useRouter } from "next/router";

// Server-side data fetching
export async function getServerSideProps() {
  try {
    // Fetch quiz data from our internal API
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.NEXT_PUBLIC_API_URL || 'localhost:3000';
    const apiUrl = `${protocol}://${host}/api/quiz?amount=10&type=multiple`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz data: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch quiz questions');
    }

    // Return the questions as props
    return {
      props: {
        initialQuestions: data.data.questions,
        error: null,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);

    // Return error state but still render the page
    return {
      props: {
        initialQuestions: [],
        error: error.message || 'Failed to load quiz questions. Please try again.',
      },
    };
  }
}

const Home = ({ initialQuestions, error }) => {
  const router = useRouter();

  // Client-side state management
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(error);
  const [answers, setAnswers] = useState([]);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Calculate progress percentage
  const progressPercentage = questions.length > 0
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  // Get current question category and difficulty
  const currentCategory = questions[currentQuestionIndex]?.category;
  const currentDifficulty = questions[currentQuestionIndex]?.difficulty;

  // Handle user answering a question
  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = startTime ? Date.now() - startTime : 0;
    const isCorrect = answer === currentQuestion.correct_answer;

    // Record the answer
    setAnswers(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect,
      timeTaken,
    }]);

    setTotalTimeTaken(prev => prev + timeTaken);

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
      setStartTime(Date.now()); // Reset timer for next question
    } else {
      setQuizCompleted(true);
    }
  };

  // Restart the quiz with fresh data from server
  const restartQuiz = async () => {
    setIsLoading(true);
    setErrorState(null);

    try {
      const response = await fetch('/api/quiz?amount=10&type=multiple');
      const data = await response.json();

      if (data.success && data.data.questions) {
        setQuestions(data.data.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizCompleted(false);
        setAnswers([]);
        setTotalTimeTaken(0);
        setStartTime(Date.now());
      } else {
        throw new Error(data.message || 'Failed to fetch quiz questions');
      }
    } catch (error) {
      console.error('Error restarting quiz:', error);
      setErrorState(error.message || 'Failed to restart quiz. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize timer when component mounts or questions change
  useEffect(() => {
    if (questions.length > 0 && !quizCompleted) {
      setStartTime(Date.now());
    }
  }, [questions.length, quizCompleted]);

  // Error state
  if (errorState) {
    return (
      <>
        <Head>
          <title>Quiz App - Error</title>
        </Head>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500">
          <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{errorState}</p>
            <button
              onClick={() => router.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  if (isLoading || (!questions.length && !errorState)) {
    return (
      <>
        <Head>
          <title>Quiz App - Loading</title>
        </Head>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4 shadow-lg"></div>
          <p className="text-white text-xl font-semibold animate-pulse">Loading quiz...</p>
          <p className="text-white/70 text-sm mt-2">Preparing your questions</p>
        </div>
      </>
    );
  }

  // Show final result
  if (quizCompleted) {
    return (
      <Result
        score={score}
        totalQuestions={questions.length}
        onRestart={restartQuiz}
        answers={answers}
        totalTimeTaken={totalTimeTaken}
      />
    );
  }

  return (
    <>
      <Head>
        <title>Quiz App - Question {currentQuestionIndex + 1}</title>
        <meta name="description" content="Test your knowledge with our interactive quiz" />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500">
        <div className="max-w-2xl w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transform hover:shadow-3xl">
          {/* Header with title and score */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Quiz App
            </h1>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full font-semibold shadow-md">
              Score: {score}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Progress</span>
              <span className="font-medium">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Category and difficulty badges */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {currentCategory && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium shadow-sm hover:bg-blue-200 transition-colors">
                📚 {currentCategory.replace(/Entertainment: /g, '')}
              </span>
            )}
            {currentDifficulty && (
              <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-transform hover:scale-105 ${
                currentDifficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentDifficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentDifficulty === 'easy' ? '🟢' : currentDifficulty === 'medium' ? '🟡' : '🔴'}{' '}
                {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
              </span>
            )}
          </div>

          {/* Question component */}
          <Question
            questionData={questions[currentQuestionIndex]}
            handleAnswer={handleAnswer}
            currentScore={score}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
