import { motion } from "framer-motion";
import {
  Target,
  TrendingDown,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Calendar,
} from "lucide-react";

/* Mock weak topics detected from quiz performance */
const weakTopics = [
  { topic: "Graph Algorithms", subject: "DSA", score: 40, suggestion: "Practice BFS/DFS and shortest path problems" },
  { topic: "Process Synchronization", subject: "OS", score: 45, suggestion: "Revise semaphores, mutex, and producer-consumer problem" },
  { topic: "Subnetting", subject: "Networks", score: 35, suggestion: "Practice CIDR notation and subnet mask calculations" },
  { topic: "Emergency Provisions", subject: "Polity", score: 50, suggestion: "Focus on Articles 352, 356, and 360" },
];

/* Mock daily study plan */
const dailyPlan = [
  { time: "9:00 AM", task: "Revise Graph Algorithms (BFS & DFS)", duration: "45 min", done: true },
  { time: "10:00 AM", task: "Practice 5 Subnetting problems", duration: "30 min", done: true },
  { time: "11:00 AM", task: "Quiz: Operating Systems (Process Sync)", duration: "20 min", done: false },
  { time: "2:00 PM", task: "Read notes: Emergency Provisions", duration: "30 min", done: false },
  { time: "3:00 PM", task: "AI Chat: Clear doubts on deadlock", duration: "15 min", done: false },
  { time: "4:00 PM", task: "Mixed quiz: All weak topics", duration: "25 min", done: false },
];

/* Mock strengths */
const strengths = [
  { topic: "Binary Trees", subject: "DSA", score: 92 },
  { topic: "SQL Queries", subject: "DBMS", score: 88 },
  { topic: "Fundamental Rights", subject: "Polity", score: 85 },
];

const Recommendations = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Smart Study Plan</h2>
        <p className="text-sm text-muted-foreground">
          AI-generated recommendations based on your quiz performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak topics card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-foreground">Focus Areas</h3>
          </div>
          <div className="space-y-3">
            {weakTopics.map((topic) => (
              <motion.div
                key={topic.topic}
                whileHover={{ x: 2 }}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {topic.topic}
                  </span>
                  <span className="text-xs font-bold text-destructive">
                    {topic.score}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {topic.subject}
                </span>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className="bg-destructive h-1.5 rounded-full"
                    style={{ width: `${topic.score}%` }}
                  />
                </div>
                <div className="flex items-start gap-1.5 mt-2">
                  <Lightbulb className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{topic.suggestion}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Strengths card */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-foreground">Your Strengths</h3>
          </div>
          <div className="space-y-3">
            {strengths.map((topic) => (
              <div
                key={topic.topic}
                className="p-3 rounded-lg bg-success/5 border border-success/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {topic.topic}
                  </span>
                  <span className="text-xs font-bold text-success">
                    {topic.score}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {topic.subject}
                </span>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className="bg-success h-1.5 rounded-full"
                    style={{ width: `${topic.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick tips */}
          <div className="mt-4 p-3 rounded-lg bg-info/10 border border-info/20">
            <p className="text-xs font-medium text-info mb-1">💡 Pro Tip</p>
            <p className="text-xs text-muted-foreground">
              Spend 70% of study time on weak topics and 30% revising strengths
              to maintain them.
            </p>
          </div>
        </div>
      </div>

      {/* Daily study plan */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-secondary" />
          <h3 className="font-semibold text-foreground">Today's Study Plan</h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {dailyPlan.filter((t) => t.done).length}/{dailyPlan.length} completed
          </span>
        </div>
        <div className="space-y-2">
          {dailyPlan.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 2 }}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                item.done ? "bg-success/5" : "bg-muted/30"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  item.done
                    ? "border-success bg-success"
                    : "border-muted-foreground"
                }`}
              >
                {item.done && (
                  <CheckCircle2 className="h-3 w-3 text-success-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    item.done
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {item.task}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {item.duration}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">
                {item.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
