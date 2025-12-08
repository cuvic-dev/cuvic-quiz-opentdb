"use client";

import { useEffect, useState, useCallback } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { decodeHtml } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setScore(null);
    setSelected({});
    setCurrentIndex(0);

    try {
      const res = await fetch(
        "https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple"
      );
      const data = await res.json();

      if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

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

    setLoading(false);
  }, []);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const chooseAnswer = (index: number, answer: string) => {
    if (selected[index]) return;
    setSelected((prev) => ({ ...prev, [index]: answer }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    calculateScore();
  };

  const calculateScore = () => {
    const s = questions.reduce(
      (acc, q, i) => (selected[i] === q.correct_answer ? acc + 1 : acc),
      0
    );
    setScore(s);
  };

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Loading Quiz...</h1>
      </main>
    );
  }

  if (score !== null) {
    return (
      <main className="p-6 max-w-xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold">Quiz Complete!</h1>
        <p className="text-2xl font-semibold">
          Score: {score} / {questions.length}
        </p>

        <Button onClick={loadQuiz} className="w-full text-lg py-3">
          Load New Quiz
        </Button>
      </main>
    );
  }

  if (!questions.length && !loading) {
    return (
      <main className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold">No quiz questions available.</h1>
        <Button onClick={loadQuiz} className="mt-4">Try Again</Button>
      </main>
    );
  }

  const q = questions[currentIndex];
  const selectedAns = selected[currentIndex];
  const answers = q.shuffled_answers ?? [];

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">OpenTDB Quiz</h1>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentIndex + 1}. {decodeHtml(q.question)}
          </CardTitle>

          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{q.category}</Badge>
            <Badge variant="secondary" className="capitalize">
              {q.difficulty}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {answers.map((ans) => {
            const correct = q.correct_answer;

            const isCorrect = selectedAns && ans === correct;
            const isWrong = selectedAns === ans && ans !== correct;

            return (
              <Button
                key={ans}
                onClick={() => chooseAnswer(currentIndex, ans)}
                disabled={!!selectedAns}
                variant="outline"
                className={[
                  "w-full justify-start text-left transition",
                  isCorrect && "bg-green-200 hover:bg-green-200",
                  isWrong && "bg-red-200 hover:bg-red-200",
                  !isCorrect && !isWrong && "bg-muted",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {decodeHtml(ans)}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {selectedAns && (
        <Button
          onClick={nextQuestion}
          className="w-full text-lg py-3 mt-4"
          variant="default"
        >
          {currentIndex === questions.length - 1
            ? "Finish Quiz"
            : "Next Question"}
        </Button>
      )}
    </main>
  );
}
