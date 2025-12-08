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
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);

  const loadQuiz = useCallback(async () => {
    setScore(null);
    setSelected({});

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

  const chooseAnswer = (index: number, answer: string) => {
    if (selected[index]) return;
    setSelected((prev) => ({ ...prev, [index]: answer }));
  };

  const calculateScore = () => {
    const s = questions.reduce(
      (acc, q, i) => (selected[i] === q.correct_answer ? acc + 1 : acc),
      0
    );
    setScore(s);
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">OpenTDB Quiz</h1>

      {questions.map((q, idx) => {
        const selectedAns = selected[idx];
        const answers = q.shuffled_answers ?? [];

        return (
          <Card key={idx} className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl">
                {idx + 1}. {decodeHtml(q.question)}
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
                    onClick={() => chooseAnswer(idx, ans)}
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
        );
      })}

      <div className="pt-4">
        {score === null ? (
          <Button onClick={calculateScore} className="w-full text-lg py-3">
            Submit Quiz
          </Button>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Score: {score} / {questions.length}
            </h2>
            <Button
              onClick={loadQuiz}
              className="w-full text-lg py-3"
              variant="secondary"
            >
              Load New Quiz
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
