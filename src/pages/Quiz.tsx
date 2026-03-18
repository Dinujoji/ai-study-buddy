import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, ChevronRight, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/* Types for quiz questions */
interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number; // index of the correct option
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  subject: string;
}

/* Mock questions - in the full version, these will be AI-generated */
const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
    explanation:
      "Binary search halves the search space each iteration, giving O(log n) time complexity.",
    difficulty: "Easy",
    subject: "DSA",
  },
  {
    id: 2,
    question: "Which scheduling algorithm can cause starvation?",
    options: ["Round Robin", "FCFS", "SJF", "None of these"],
    correct: 2,
    explanation:
      "Shortest Job First (SJF) can cause starvation for longer processes if short processes keep arriving.",
    difficulty: "Medium",
    subject: "Operating Systems",
  },
  {
    id: 3,
    question: "What does ACID stand for in databases?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Availability, Consistency, Isolation, Durability",
      "Atomicity, Concurrency, Isolation, Durability",
      "Atomicity, Consistency, Integration, Durability",
    ],
    correct: 0,
    explanation:
      "ACID stands for Atomicity, Consistency, Isolation, and Durability — the four key properties of reliable database transactions.",
    difficulty: "Easy",
    subject: "DBMS",
  },
  {
    id: 4,
    question: "Which Article of the Indian Constitution deals with Right to Equality?",
    options: ["Article 12", "Article 14", "Article 19", "Article 21"],
    correct: 1,
    explanation:
      "Article 14 guarantees equality before law and equal protection of laws to all persons within the territory of India.",
    difficulty: "Medium",
    subject: "Indian Polity",
  },
  {
    id: 5,
    question: "What is the purpose of ARP in computer networks?",
    options: [
      "Convert domain names to IPs",
      "Convert IP addresses to MAC addresses",
      "Route packets between networks",
      "Encrypt network traffic",
    ],
    correct: 1,
    explanation:
      "ARP (Address Resolution Protocol) maps IP addresses to MAC (hardware) addresses on a local network.",
    difficulty: "Medium",
    subject: "Networks",
  },
];

const subjects = ["All", "DSA", "Operating Systems", "DBMS", "Indian Polity", "Networks"];

const Quiz = () => {
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const filteredQuestions =
    selectedSubject === "All"
      ? mockQuestions
      : mockQuestions.filter((q) => q.subject === selectedSubject);

  const currentQuestion = filteredQuestions[currentIndex];

  const handleSelect = useCallback(
    (index: number) => {
      if (showResult) return; // prevent re-selection
      setSelectedOption(index);
      setShowResult(true);
      if (index === currentQuestion.correct) {
        setScore((s) => s + 1);
      }
      setAnswers((prev) => [...prev, index]);
    },
    [showResult, currentQuestion]
  );

  const handleNext = () => {
    if (currentIndex + 1 >= filteredQuestions.length) {
      setQuizComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setAnswers([]);
  };

  /* Quiz complete screen */
  if (quizComplete) {
    const percentage = Math.round((score / filteredQuestions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          <div className="gradient-primary inline-flex rounded-full p-4 mb-4">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Quiz Complete!</h2>
          <p className="text-4xl font-bold mt-4 text-gradient">{percentage}%</p>
          <p className="text-muted-foreground mt-1">
            {score} out of {filteredQuestions.length} correct
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {percentage >= 80
              ? "🎉 Excellent! You're mastering this topic!"
              : percentage >= 60
              ? "👍 Good job! Keep practicing to improve."
              : "💪 Keep studying! Review the explanations below."}
          </p>
          <Button onClick={handleRestart} className="mt-6 gradient-primary text-primary-foreground">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </motion.div>

        {/* Review answers */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Review Answers</h3>
          {filteredQuestions.map((q, i) => (
            <div key={q.id} className="glass-card rounded-xl p-4">
              <p className="text-sm font-medium text-foreground">{q.question}</p>
              <p className="text-xs mt-2 text-muted-foreground">
                Your answer:{" "}
                <span
                  className={
                    answers[i] === q.correct ? "text-success" : "text-destructive"
                  }
                >
                  {q.options[answers[i] ?? 0]}
                </span>
              </p>
              {answers[i] !== q.correct && (
                <p className="text-xs text-success mt-1">
                  Correct: {q.options[q.correct]}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2 italic">
                {q.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Subject filter chips */}
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSelectedSubject(s);
              handleRestart();
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedSubject === s
                ? "gradient-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-muted rounded-full h-2">
          <div
            className="gradient-primary h-2 rounded-full transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {currentIndex + 1}/{filteredQuestions.length}
        </span>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-2xl p-6"
        >
          {/* Difficulty badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                currentQuestion.difficulty === "Easy"
                  ? "bg-success/20 text-success"
                  : currentQuestion.difficulty === "Medium"
                  ? "bg-accent/20 text-accent"
                  : "bg-destructive/20 text-destructive"
              }`}
            >
              <Zap className="h-3 w-3 inline mr-1" />
              {currentQuestion.difficulty}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentQuestion.subject}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-6">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let optionStyle =
                "border border-border bg-background hover:border-secondary/50";
              if (showResult) {
                if (index === currentQuestion.correct) {
                  optionStyle =
                    "border-2 border-success bg-success/10";
                } else if (
                  index === selectedOption &&
                  index !== currentQuestion.correct
                ) {
                  optionStyle =
                    "border-2 border-destructive bg-destructive/10";
                } else {
                  optionStyle = "border border-border bg-background opacity-50";
                }
              } else if (index === selectedOption) {
                optionStyle = "border-2 border-secondary bg-secondary/10";
              }

              return (
                <motion.button
                  key={index}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${optionStyle}`}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm text-foreground">{option}</span>
                  {showResult && index === currentQuestion.correct && (
                    <CheckCircle2 className="h-5 w-5 text-success ml-auto flex-shrink-0" />
                  )}
                  {showResult &&
                    index === selectedOption &&
                    index !== currentQuestion.correct && (
                      <XCircle className="h-5 w-5 text-destructive ml-auto flex-shrink-0" />
                    )}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation shown after answering */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-5 p-4 rounded-xl bg-muted/50 border border-border"
              >
                <p className="text-sm text-foreground font-medium mb-1">
                  💡 Explanation
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5 flex justify-end"
            >
              <Button onClick={handleNext} className="gradient-primary text-primary-foreground">
                {currentIndex + 1 >= filteredQuestions.length
                  ? "View Results"
                  : "Next Question"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
