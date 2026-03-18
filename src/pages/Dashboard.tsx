import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Flame,
  Target,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  gradient: string;
}) => (
  <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
      <div className={`${gradient} rounded-lg p-2.5`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    streak: 0,
    longestStreak: 0,
    quizzesTaken: 0,
    avgScore: 0,
    totalMinutes: 0,
    notesCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState<{ day: string; minutes: number }[]>([]);
  const [displayName, setDisplayName] = useState("Student");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();
      if (profile?.display_name) setDisplayName(profile.display_name);

      // Fetch streak
      const { data: streak } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Fetch quiz results
      const { data: quizzes } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id);

      // Fetch notes count
      const { count: notesCount } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch study sessions
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id);

      const totalMinutes = sessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;
      const avgScore = quizzes && quizzes.length > 0
        ? Math.round(quizzes.reduce((acc, q) => acc + (q.score / q.total_questions) * 100, 0) / quizzes.length)
        : 0;

      setStats({
        streak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
        quizzesTaken: quizzes?.length || 0,
        avgScore,
        totalMinutes,
        notesCount: notesCount || 0,
      });

      // Build weekly data from sessions
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);

      const weekly = days.map((day, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dayStr = date.toISOString().split("T")[0];
        const mins = sessions
          ?.filter((s) => s.created_at.startsWith(dayStr))
          .reduce((acc, s) => acc + s.duration_minutes, 0) || 0;
        return { day, minutes: mins };
      });
      setWeeklyData(weekly);
    };

    fetchData();
  }, [user]);

  const overallProgress = [{ name: "Progress", value: stats.avgScore, fill: "hsl(174, 60%, 50%)" }];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {displayName}! 👋</h2>
        <p className="text-muted-foreground mt-1">Here's your learning progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Current Streak" value={`${stats.streak} days`} sub={`Best: ${stats.longestStreak} days`} gradient="gradient-accent" />
        <StatCard icon={Brain} label="Quizzes Taken" value={String(stats.quizzesTaken)} sub="AI-generated quizzes" gradient="gradient-primary" />
        <StatCard icon={Target} label="Avg Score" value={`${stats.avgScore}%`} sub="Across all quizzes" gradient="gradient-success" />
        <StatCard icon={Clock} label="Study Time" value={`${Math.round(stats.totalMinutes / 60 * 10) / 10} hrs`} sub="Total recorded" gradient="gradient-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Weekly Study Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="minutes" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-foreground mb-2">Overall Score</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={overallProgress} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--muted))" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-3xl font-bold text-foreground -mt-4">{stats.avgScore}%</p>
          <p className="text-sm text-muted-foreground">Average quiz score</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/quiz">
            <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-colors">
              <Brain className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-foreground text-sm">Start a Quiz</h4>
              <p className="text-xs text-muted-foreground mt-1">AI-generated adaptive questions</p>
            </motion.div>
          </Link>
          <Link to="/chat">
            <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-5 cursor-pointer hover:border-secondary/50 transition-colors">
              <BookOpen className="h-6 w-6 text-secondary mb-2" />
              <h4 className="font-medium text-foreground text-sm">Ask AI Tutor</h4>
              <p className="text-xs text-muted-foreground mt-1">Get instant explanations</p>
            </motion.div>
          </Link>
          <Link to="/recommendations">
            <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-5 cursor-pointer hover:border-accent/50 transition-colors">
              <TrendingUp className="h-6 w-6 text-accent mb-2" />
              <h4 className="font-medium text-foreground text-sm">Study Plan</h4>
              <p className="text-xs text-muted-foreground mt-1">AI-powered daily schedule</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
