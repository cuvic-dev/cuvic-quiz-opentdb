"use client";

import { useEffect, useState, useCallback } from "react";

type Question = {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  shuffled_answers?: string[];
};

export default function QuizPage() {

  const [questions, setQuestions] = useState<Question[]>([]);

  const loadQuiz = useCallback(async () => {

    try {
      const res = await fetch(
        "https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple"
      );
      const data = await res.json();

      const processed: Question[] = data.results.map((q: Question) => ({
        ...q,
        shuffled_answers: [...q.incorrect_answers, q.correct_answer].sort(
          () => Math.random() - 0.5
        ),
      }));

      setQuestions(processed);
      
    } catch (err) {
      console.error("Failed loading quiz:", err);
    }

  }, []);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-medium">Quiz Page</h1>
    </div>
  );
}
