"use client";

import { useEffect, useState, useCallback } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

  const [quizStarted, setQuizStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [amount, setAmount] = useState(10);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setScore(null);
    setSelected({});
    setCurrentIndex(0);

    try {
      const res = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple`
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
  }, [difficulty, amount]);

  const startQuiz = async () => {
    setQuizStarted(true);
    await loadQuiz();
  };

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

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 space-y-5 rounded-2xl shadow-lg">
          <CardTitle className="text-3xl font-bold text-center">Start Quiz</CardTitle>

          <div className="space-y-3">
            <label className="font-medium">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {["easy", "medium", "hard"].map((d) => (
                <Button
                  key={d}
                  variant={difficulty === d ? "default" : "outline"}
                  onClick={() => setDifficulty(d)}
                  className="capitalize py-2"
                >
                  {d}
                </Button>
              ))}
            </div>

            <label className="font-medium mt-4">Number of Questions</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="text-lg"
            />
          </div>

          <Button className="w-full py-4 text-lg" onClick={startQuiz}>
            Start Quiz
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="p-6 flex justify-center items-center min-h-[60vh]">
        <h1 className="text-3xl font-semibold animate-pulse">Loading Quiz…</h1>
      </main>
    );
  }

  if (score !== null) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <main className="max-w-xl mx-auto space-y-6 text-center px-6">
          <h1 className="text-4xl font-bold">🎉 Quiz Complete!</h1>
          <p className="text-3xl font-semibold">
            Score: {score} / {questions.length}
          </p>

          <Button
            onClick={() => {
              setQuizStarted(false);
              setScore(null);
              setQuestions([]);
            }}
            className="w-full text-lg py-4 mt-4"
          >
            Start New Quiz
          </Button>
        </main>
      </div>
    );
  }


  if (!questions.length && !loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <main className="max-w-xl mx-auto text-center px-6">
          <h1 className="text-2xl font-bold">No quiz questions available.</h1>
          <Button onClick={loadQuiz} className="mt-4">
            Try Again
          </Button>
        </main>
      </div>
    );
  }

  
  const q = questions[currentIndex];
  const selectedAns = selected[currentIndex];
  const answers = q.shuffled_answers ?? [];

  return (
    <div className="min-h-screen flex justify-center items-center">
      <main className="p-6 max-w-3xl mx-auto space-y-8 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">OpenTDB Quiz</h1>
          <p className="text-lg text-muted-foreground">
            Question <span className="font-semibold">{currentIndex + 1}</span> / {questions.length}
          </p>
        </div>

        <Card className="rounded-2xl shadow-md border border-accent/20">
          <CardHeader>
            <CardTitle className="text-2xl leading-relaxed">
              {decodeHtml(q.question)}
            </CardTitle>

            <div className="flex gap-2 mt-3">
              <Badge variant="outline">{q.category}</Badge>
              <Badge variant="secondary" className="capitalize px-3 py-1">
                {q.difficulty}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 mt-3">
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
                    "w-full text-left px-4 py-4 text-lg rounded-xl transition-all",
                    "hover:bg-accent/40",
                    isCorrect && "bg-green-300/70 border-green-600 text-black",
                    isWrong && "bg-red-300/70 border-red-600 text-black",
                    !isCorrect && !isWrong && "bg-muted"
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

        <div className="min-h-[4.5rem] mt-2 flex items-center">
          {selectedAns ? (
            <Button
              onClick={nextQuestion}
              className="w-full text-lg py-4 rounded-xl"
            >
              {currentIndex === questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
            </Button>
          ) : null}
        </div>

      </main>
    </div>
  );
}
