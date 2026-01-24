import { useEffect, useRef, useState, useCallback } from "react";
import { sleep } from "@/utils/time";

const MAX_RETRY = 5;
const QUIZ_TIMEOUT = 30; // seconds per question

export const useQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_TIMEOUT);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [answers, setAnswers] = useState([]);
  const firstRun = useRef(true);
  const timerRef = useRef(null);
  const questionStartTimeRef = useRef(null);

  // Function to fetch quiz questions with enhanced error handling
  const fetchQuestions = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        "https://opentdb.com/api.php?amount=10&type=multiple"
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.response_code === 0 && data.results && data.results.length > 0) {
        setQuestions(data.results);
        setRetryCount(0);
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswers([]);
        setQuizCompleted(false);
        setError(null);
        startTimer();
      } else if (retryCount < MAX_RETRY) {
        console.warn("Refetching questions, retry count:", retryCount + 1);
        await sleep(2000);
        firstRun.current = true;
        setRetryCount(retryCount + 1);
      } else {
        setError(
          "Failed to fetch quiz questions after multiple attempts. Please check your internet connection and try again."
        );
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      setError(
        error.message === "Failed to fetch" 
          ? "Unable to connect to the quiz server. Please check your internet connection."
          : "An unexpected error occurred. Please try again."
      );
      
      if (retryCount < MAX_RETRY) {
        await sleep(3000);
        firstRun.current = true;
        setRetryCount(retryCount + 1);
      }
    }
  }, [retryCount]);

  // Timer management
  const startTimer = useCallback(() => {
    setTimeRemaining(QUIZ_TIMEOUT);
    questionStartTimeRef.current = Date.now();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Date.now() - questionStartTimeRef.current;
    
    setAnswers(prev => [...prev, {
      question: currentQuestion,
      userAnswer: null,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect: false,
      timeTaken,
      timedOut: true
    }]);
    
    setTotalTimeTaken(prev => prev + timeTaken);
    
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
      startTimer();
    } else {
      setQuizCompleted(true);
      stopTimer();
    }
  }, [currentQuestionIndex, questions, startTimer, stopTimer]);

  // Handle user answering a question
  const handleAnswer = useCallback((answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    const timeTaken = Date.now() - questionStartTimeRef.current;
    
    // Record answer
    setAnswers(prev => [...prev, {
      question: currentQuestion,
      userAnswer: answer,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect,
      timeTaken,
      timedOut: false
    }]);
    
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
    
    setTotalTimeTaken(prev => prev + timeTaken);
    stopTimer();
    
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
      setTimeout(startTimer, 100); // Small delay before next question
    } else {
      setQuizCompleted(true);
    }
  }, [currentQuestionIndex, questions, startTimer, stopTimer]);

  // Restart the quiz
  const restartQuiz = useCallback(() => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setRetryCount(0);
    setTotalTimeTaken(0);
    setAnswers([]);
    setError(null);
    firstRun.current = true;
    stopTimer();
    fetchQuestions();
  }, [fetchQuestions, stopTimer]);

  // Calculate quiz statistics
  const getStatistics = useCallback(() => {
    if (answers.length === 0) return null;
    
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const avgTimePerQuestion = totalTimeTaken / answers.length;
    const fastestAnswer = Math.min(...answers.map(a => a.timeTaken));
    const slowestAnswer = Math.max(...answers.map(a => a.timeTaken));
    
    return {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers: answers.length - correctAnswers,
      accuracy: (correctAnswers / answers.length) * 100,
      avgTimePerQuestion: Math.round(avgTimePerQuestion),
      fastestAnswer,
      slowestAnswer,
      totalTime: totalTimeTaken
    };
  }, [answers, totalTimeTaken, questions.length]);

  // Skip current question
  const skipQuestion = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Date.now() - questionStartTimeRef.current;
    
    setAnswers(prev => [...prev, {
      question: currentQuestion,
      userAnswer: null,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect: false,
      timeTaken,
      skipped: true
    }]);
    
    setTotalTimeTaken(prev => prev + timeTaken);
    stopTimer();
    
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
      setTimeout(startTimer, 100);
    } else {
      setQuizCompleted(true);
    }
  }, [currentQuestionIndex, questions, startTimer, stopTimer]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      fetchQuestions();
    }
  }, [fetchQuestions]);

  return {
    questions,
    currentQuestionIndex,
    score,
    quizCompleted,
    handleAnswer,
    restartQuiz,
    isLoading: !questions.length && retryCount < MAX_RETRY && !error,
    error,
    timeRemaining,
    answers,
    statistics: getStatistics(),
    skipQuestion,
    totalTimeTaken
  };
};