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
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 max-w-md w-full p-6 rounded-2xl shadow-2xl animate-fadeIn space-y-5">
          <CardTitle className="text-4xl font-extrabold text-center text-white drop-shadow">
            Start Quiz
          </CardTitle>

          <div className="space-y-3 text-white">
            <label className="font-medium">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {["easy", "medium", "hard"].map((d) => {
                const isActive = difficulty === d;
                return (
                  <Button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={[
                      "capitalize py-3 rounded-xl font-semibold transition-all",
                      "border",
                      isActive
                        ? "bg-blue-500 text-white border-blue-400 shadow-md"
                        : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                    ].join(" ")}
                  >
                    {d}
                  </Button>
                );
              })}
            </div>

            <label className="font-medium mt-4">Number of Questions</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="text-lg bg-white/20 border-white/40 text-white"
            />
          </div>

          <Button className="w-full py-4 text-lg rounded-xl bg-blue-600 hover:bg-blue-700" onClick={startQuiz}>
            Start Quiz
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex justify-center items-center">
        <h1 className="text-3xl font-semibold text-white animate-pulse">Loading Quiz…</h1>
      </main>
    );
  }

  if (score !== null) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-slate-900 px-4">
        <main className="max-w-xl mx-auto space-y-6 text-center px-6">
          <h1 className="text-5xl font-extrabold text-white drop-shadow">🎉 Quiz Complete!</h1>
          <p className="text-3xl font-semibold text-blue-300">
            Score: {score} / {questions.length}
          </p>

          <Button
            onClick={() => {
              setQuizStarted(false);
              setScore(null);
              setQuestions([]);
            }}
            className="w-full text-lg py-4 mt-4 rounded-xl bg-blue-600 hover:bg-blue-700"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex justify-center items-center px-4">
      <main className="p-6 max-w-3xl mx-auto space-y-8 w-full animate-fadeIn">
        <div className="flex justify-between items-center text-white">
          <h1 className="text-4xl font-bold">OpenTDB Quiz</h1>
          <p className="text-lg">
            Question <span className="font-bold">{currentIndex + 1}</span> / {questions.length}
          </p>
        </div>

        <Card className="rounded-2xl shadow-xl border border-white/10 bg-white/10 backdrop-blur-lg text-white">
          <CardHeader>
            <CardTitle className="text-2xl leading-relaxed">
              {decodeHtml(q.question)}
            </CardTitle>

            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="border-white/40 text-white">
                {q.category}
              </Badge>
              <Badge
                variant="secondary"
                className="capitalize px-3 py-1 bg-blue-600 text-white"
              >
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
                    "w-full text-left px-4 py-4 text-lg rounded-xl transition-all duration-300",
                    "bg-white/5 border-white/20 text-white hover:bg-white/20",
                    isCorrect && "bg-green-400/70 border-green-600 text-black",
                    isWrong && "bg-red-400/70 border-red-600 text-black",
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

        <div className="mt-4">
          {selectedAns && (
            <Button
              onClick={nextQuestion}
              className="w-full text-lg py-4 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {currentIndex === questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
            </Button>
          )}
        </div>

      </main>
    </div>
  );
}
