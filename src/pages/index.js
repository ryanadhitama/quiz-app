import { useQuiz } from "@/hooks/useQuiz";
import Question from "../components/question";
import Result from "../components/result";
import Head from "next/head";

const Home = () => {
  const {
    questions,
    currentQuestionIndex,
    score,
    quizCompleted,
    handleAnswer,
    restartQuiz,
    isLoading,
  } = useQuiz();

  // Loading state
  if (isLoading) return <p className="text-center mt-8">Loading...</p>;

  // Show final result
  if (quizCompleted) {
    return (
      <Result
        score={score}
        totalQuestions={questions.length}
        onRestart={restartQuiz}
      />
    );
  }

  return (
    <>
      <Head>
        <title>Quiz App</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <h1 className="mb-6 font-bold text-3xl">Quiz App</h1>
        <Question
          questionData={questions[currentQuestionIndex]}
          handleAnswer={handleAnswer}
          currentScore={score}
        />
      </div>
    </>
  );
};

export default Home;
