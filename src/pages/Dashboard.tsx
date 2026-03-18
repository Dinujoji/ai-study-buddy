import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Flame,
  Target,
  TrendingUp,
  Clock,
  Star,
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
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts";

/* Mock data for the dashboard - will be replaced with real data from Lovable Cloud */
const weeklyProgress = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 60 },
  { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 90 },
  { day: "Fri", minutes: 55 },
  { day: "Sat", minutes: 75 },
  { day: "Sun", minutes: 40 },
];

const subjectScores = [
  { subject: "DSA", score: 78 },
  { subject: "OS", score: 65 },
  { subject: "DBMS", score: 82 },
  { subject: "Networks", score: 55 },
  { subject: "Polity", score: 70 },
  { subject: "History", score: 60 },
];

const overallProgress = [{ name: "Progress", value: 68, fill: "hsl(174, 60%, 50%)" }];

const subjects = [
  { name: "Data Structures", progress: 78, total: 45, completed: 35, color: "bg-primary" },
  { name: "Operating Systems", progress: 65, total: 30, completed: 19, color: "bg-secondary" },
  { name: "DBMS", progress: 82, total: 25, completed: 20, color: "bg-success" },
  { name: "Computer Networks", progress: 55, total: 35, completed: 19, color: "bg-info" },
  { name: "Indian Polity (UPSC)", progress: 70, total: 40, completed: 28, color: "bg-accent" },
  { name: "Modern History", progress: 60, total: 30, completed: 18, color: "bg-streak" },
];

/* Stat card component for the top row */
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
  <motion.div
    whileHover={{ y: -2 }}
    className="glass-card rounded-xl p-5"
  >
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
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, Student! 👋</h2>
        <p className="text-muted-foreground mt-1">
          Here's your learning progress for this week
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Current Streak"
          value="7 days"
          sub="Personal best: 14 days"
          gradient="gradient-accent"
        />
        <StatCard
          icon={Brain}
          label="Quizzes Taken"
          value="42"
          sub="+5 this week"
          gradient="gradient-primary"
        />
        <StatCard
          icon={Target}
          label="Avg Score"
          value="76%"
          sub="↑ 4% from last week"
          gradient="gradient-success"
        />
        <StatCard
          icon={Clock}
          label="Study Time"
          value="6.5 hrs"
          sub="This week total"
          gradient="gradient-primary"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly study time bar chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Weekly Study Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyProgress}>
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

        {/* Overall progress radial */}
        <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-foreground mb-2">Overall Progress</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={overallProgress}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                background={{ fill: "hsl(var(--muted))" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-3xl font-bold text-foreground -mt-4">68%</p>
          <p className="text-sm text-muted-foreground">Across all subjects</p>
        </div>
      </div>

      {/* Subject performance line chart */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Subject Performance</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={subjectScores}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", r: 5 }}
              activeDot={{ r: 7, fill: "hsl(var(--secondary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subjects list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Your Subjects</h3>
          <Link
            to="/quiz"
            className="text-sm text-secondary hover:underline flex items-center gap-1"
          >
            Start Quiz <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <motion.div
              key={subject.name}
              whileHover={{ y: -2 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${subject.color} h-2.5 w-2.5 rounded-full`} />
                <h4 className="font-medium text-foreground text-sm">{subject.name}</h4>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div
                  className={`${subject.color} h-2 rounded-full transition-all`}
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{subject.completed}/{subject.total} topics</span>
                <span>{subject.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
