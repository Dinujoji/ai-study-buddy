import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, ChevronRight, RotateCcw, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: string;
  topic?: string;
}

const subjects = ["Data Structures & Algorithms", "Operating Systems", "DBMS", "Computer Networks", "Indian Polity", "Modern History"];

const Quiz = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");

  const generateQuiz = async (subject: string) => {
    setLoading(true);
    setSelectedSubject(subject);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { subject, difficulty, count: 5 },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions);
      setDifficulty(data.difficulty);
      setCurrentIndex(0);
      setSelectedOption(null);
      setShowResult(false);
      setScore(0);
      setQuizComplete(false);
      setAnswers([]);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Quiz Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback(
    (index: number) => {
      if (showResult || !questions[currentIndex]) return;
      setSelectedOption(index);
      setShowResult(true);
      if (index === questions[currentIndex].correct) {
        setScore((s) => s + 1);
      }
      setAnswers((prev) => [...prev, index]);
    },
    [showResult, questions, currentIndex]
  );

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizComplete(true);
      // Save result to database
      if (user) {
        supabase.from("quiz_results").insert({
          user_id: user.id,
          score,
          total_questions: questions.length,
          difficulty,
          questions_data: questions as any,
        }).then(({ error }) => {
          if (error) console.error("Failed to save quiz result:", error);
        });
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    if (selectedSubject) generateQuiz(selectedSubject);
  };

  // Subject selection screen
  if (!selectedSubject || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">AI-Powered Quiz</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a subject and AI will generate personalized questions
          </p>
        </div>

        {/* Difficulty selector */}
        <div className="flex justify-center gap-2">
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-colors ${
                difficulty === d ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((s) => (
            <motion.button
              key={s}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateQuiz(s)}
              disabled={loading}
              className="glass-card rounded-xl p-5 text-left hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="gradient-primary rounded-lg p-2">
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-medium text-foreground text-sm">{s}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generating questions with AI...</span>
          </div>
        )}
      </div>
    );
  }

  // Quiz complete screen
  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
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
          <p className="text-muted-foreground mt-1">{score} out of {questions.length} correct</p>
          <p className="text-sm text-muted-foreground mt-4">
            {percentage >= 80 ? "🎉 Excellent!" : percentage >= 60 ? "👍 Good job!" : "💪 Keep studying!"}
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={handleRestart} className="gradient-primary text-primary-foreground">
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button variant="outline" onClick={() => { setSelectedSubject(""); setQuestions([]); }}>
              Change Subject
            </Button>
          </div>
        </motion.div>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Review Answers</h3>
          {questions.map((q, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <p className="text-sm font-medium text-foreground">{q.question}</p>
              <p className="text-xs mt-2 text-muted-foreground">
                Your answer:{" "}
                <span className={answers[i] === q.correct ? "text-success" : "text-destructive"}>
                  {q.options[answers[i] ?? 0]}
                </span>
              </p>
              {answers[i] !== q.correct && (
                <p className="text-xs text-success mt-1">Correct: {q.options[q.correct]}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2 italic">{q.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{selectedSubject}</span>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedSubject(""); setQuestions([]); }}>
          Change Subject
        </Button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-muted rounded-full h-2">
          <div
            className="gradient-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground font-medium">{currentIndex + 1}/{questions.length}</span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              currentQuestion.difficulty === "easy" ? "bg-success/20 text-success"
              : currentQuestion.difficulty === "hard" ? "bg-destructive/20 text-destructive"
              : "bg-accent/20 text-accent"
            }`}>
              <Zap className="h-3 w-3 inline mr-1" />
              {currentQuestion.difficulty}
            </span>
            {currentQuestion.topic && (
              <span className="text-xs text-muted-foreground">{currentQuestion.topic}</span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-6">{currentQuestion.question}</h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let optionStyle = "border border-border bg-background hover:border-secondary/50";
              if (showResult) {
                if (index === currentQuestion.correct) optionStyle = "border-2 border-success bg-success/10";
                else if (index === selectedOption) optionStyle = "border-2 border-destructive bg-destructive/10";
                else optionStyle = "border border-border bg-background opacity-50";
              }

              return (
                <motion.button
                  key={index}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  onClick={() => handleSelect(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${optionStyle}`}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm text-foreground">{option}</span>
                  {showResult && index === currentQuestion.correct && <CheckCircle2 className="h-5 w-5 text-success ml-auto" />}
                  {showResult && index === selectedOption && index !== currentQuestion.correct && <XCircle className="h-5 w-5 text-destructive ml-auto" />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5 p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-foreground font-medium mb-1">💡 Explanation</p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {showResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex justify-end">
              <Button onClick={handleNext} className="gradient-primary text-primary-foreground">
                {currentIndex + 1 >= questions.length ? "View Results" : "Next Question"}
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
