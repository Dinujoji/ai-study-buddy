import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PlanItem {
  time: string;
  task: string;
  duration: string;
  subject?: string;
  priority?: string;
}

interface StudyPlan {
  dailyPlan: PlanItem[];
  weeklyGoals: string[];
  tips: string[];
}

const Recommendations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [weakTopics, setWeakTopics] = useState<{ topic: string; subject: string; score: number }[]>([]);

  // Fetch quiz results to find weak topics
  useEffect(() => {
    if (!user) return;
    const fetchWeakTopics = async () => {
      const { data } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const weak = data
          .filter((r) => (r.score / r.total_questions) * 100 < 70)
          .map((r) => ({
            topic: r.difficulty,
            subject: r.subject_id || "General",
            score: Math.round((r.score / r.total_questions) * 100),
          }));
        setWeakTopics(weak);
      }
    };
    fetchWeakTopics();
  }, [user]);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("study-plan", {
        body: {
          subjects: ["Data Structures", "Operating Systems", "DBMS", "Computer Networks", "Indian Polity"],
          weakTopics: weakTopics.map((w) => w.subject),
          goal: "Semester exams",
          hoursPerDay: 4,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setPlan(data);
      setCompletedTasks(new Set());
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Study Planner</h2>
          <p className="text-sm text-muted-foreground">
            Get personalized study plans powered by AI
          </p>
        </div>
        <Button
          onClick={generatePlan}
          disabled={loading}
          className="gradient-primary text-primary-foreground"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
          ) : plan ? (
            <><RefreshCw className="h-4 w-4 mr-2" /> Regenerate</>
          ) : (
            "Generate Plan"
          )}
        </Button>
      </div>

      {/* Weak topics from quiz data */}
      {weakTopics.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-foreground">Detected Weak Areas</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weakTopics.map((topic, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{topic.subject}</span>
                  <span className="text-xs font-bold text-destructive">{topic.score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div className="bg-destructive h-1.5 rounded-full" style={{ width: `${topic.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated plan */}
      {plan && (
        <>
          {/* Daily plan */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Today's Study Plan</h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {completedTasks.size}/{plan.dailyPlan.length} completed
              </span>
            </div>
            <div className="space-y-2">
              {plan.dailyPlan.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 2 }}
                  onClick={() => toggleTask(i)}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                    completedTasks.has(i) ? "bg-success/5" : "bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      completedTasks.has(i) ? "border-success bg-success" : "border-muted-foreground"
                    }`}
                  >
                    {completedTasks.has(i) && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${completedTasks.has(i) ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {item.task}
                    </p>
                    {item.subject && <span className="text-xs text-muted-foreground">{item.subject}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.duration}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly goals & tips */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {plan.weeklyGoals && plan.weeklyGoals.length > 0 && (
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Weekly Goals</h3>
                </div>
                <ul className="space-y-2">
                  {plan.weeklyGoals.map((goal, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.tips && plan.tips.length > 0 && (
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">AI Tips</h3>
                </div>
                <ul className="space-y-2">
                  {plan.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">💡</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {!plan && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Click "Generate Plan" to get your AI-powered study schedule</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
