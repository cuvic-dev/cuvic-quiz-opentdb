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
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">OpenTDB Quiz</h1>

      {questions.map((q, idx) => {
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
                return (
                  <Button
                    key={ans}
                    variant="outline"
                  >
                    {decodeHtml(ans)}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

    </main>
  );
}
