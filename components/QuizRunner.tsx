import React, { useEffect, useMemo, useState } from 'react';
import { ElementCategory, ElementData, QuizMode, QuizResult } from '../types';

interface QuizRunnerProps {
  elements: ElementData[];
  mode: QuizMode;
  timed: boolean;
  onComplete: (result: QuizResult, breakdown: { category: ElementCategory; group: number; period: number; correct: boolean }[]) => void;
}

interface Question {
  prompt: string;
  options: string[];
  answer: string;
  category: ElementCategory;
  group: number;
  period: number;
}

const shuffle = <T,>(arr: T[]) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const QuizRunner: React.FC<QuizRunnerProps> = ({ elements, mode, timed, onComplete }) => {
  const totalQuestions = Math.min(10, elements.length);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [timeLeft, setTimeLeft] = useState(60);
  const [breakdown, setBreakdown] = useState<{ category: ElementCategory; group: number; period: number; correct: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setQuestionIndex(0);
    setCorrectCount(0);
    setSelected(null);
    setBreakdown([]);
    setIsFinished(false);
    setTimeLeft(60);
    setStartedAt(Date.now());
  }, [mode, timed, elements]);

  const question = useMemo<Question>(() => {
    const element = elements[Math.floor(Math.random() * elements.length)];
    const options: string[] = [];
    let prompt = '';
    let answer = '';
    if (mode === 'symbol') {
      prompt = `What is the name of the element with symbol ${element.symbol}?`;
      answer = element.name;
      options.push(element.name);
      while (options.length < 4) {
        const option = elements[Math.floor(Math.random() * elements.length)].name;
        if (!options.includes(option)) options.push(option);
      }
    } else if (mode === 'name') {
      prompt = `What is the symbol for ${element.name}?`;
      answer = element.symbol;
      options.push(element.symbol);
      while (options.length < 4) {
        const option = elements[Math.floor(Math.random() * elements.length)].symbol;
        if (!options.includes(option)) options.push(option);
      }
    } else if (mode === 'atomicNumber') {
      prompt = `Which element has atomic number ${element.atomicNumber}?`;
      answer = element.name;
      options.push(element.name);
      while (options.length < 4) {
        const option = elements[Math.floor(Math.random() * elements.length)].name;
        if (!options.includes(option)) options.push(option);
      }
    } else if (mode === 'group') {
      prompt = `What group is ${element.name} in?`;
      answer = String(element.group);
      const possible = shuffle(Array.from({ length: 18 }, (_, i) => String(i + 1))).slice(0, 3);
      options.push(answer, ...possible.filter(o => o !== answer).slice(0, 3));
    } else {
      prompt = `What period is ${element.name} in?`;
      answer = String(element.period);
      const possible = shuffle(Array.from({ length: 7 }, (_, i) => String(i + 1))).slice(0, 3);
      options.push(answer, ...possible.filter(o => o !== answer).slice(0, 3));
    }
    return { prompt, options: shuffle(options), answer, category: element.category, group: element.group, period: element.period };
  }, [elements, mode, questionIndex]);

  useEffect(() => {
    if (!timed || isFinished) return;
    if (timeLeft <= 0) {
      onComplete(
        {
          mode,
          correct: correctCount,
          total: questionIndex,
          durationMs: Date.now() - startedAt,
          timestamp: Date.now(),
        },
        breakdown
      );
      setIsFinished(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timed, timeLeft, correctCount, mode, questionIndex, startedAt, breakdown, onComplete]);

  const handleAnswer = (choice: string) => {
    if (selected || isFinished) return;
    const isCorrect = choice === question.answer;
    setSelected(choice);
    setBreakdown(prev => [...prev, { category: question.category, group: question.group, period: question.period, correct: isCorrect }]);
    if (isCorrect) setCorrectCount(prev => prev + 1);
  };

  const nextQuestion = () => {
    if (isFinished) return;
    if (questionIndex + 1 >= totalQuestions) {
      onComplete(
        {
          mode,
          correct: correctCount,
          total: totalQuestions,
          durationMs: Date.now() - startedAt,
          timestamp: Date.now(),
        },
        breakdown
      );
      setIsFinished(true);
      return;
    }
    setSelected(null);
    setQuestionIndex(prev => prev + 1);
  };

  if (elements.length < 4) {
    return <div className="text-sm text-gray-600 dark:text-gray-300">Not enough elements to run this quiz.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <span>Question {questionIndex + 1} / {totalQuestions}</span>
        {timed && <span>Time left: {timeLeft}s</span>}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{question.prompt}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map(option => {
          const isCorrect = selected && option === question.answer;
          const isWrong = selected === option && option !== question.answer;
          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={!!selected}
              className={`px-4 py-2 rounded-lg border text-left transition-colors ${
                isCorrect ? 'bg-emerald-500 text-white border-emerald-500'
                : isWrong ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">Score: {correctCount}</div>
        <button
          onClick={nextQuestion}
          disabled={!selected}
          className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold"
        >
          {questionIndex + 1 >= totalQuestions ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default QuizRunner;
