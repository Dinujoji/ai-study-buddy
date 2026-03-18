import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

/* Types for chat messages */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/* Suggested prompts for quick access */
const suggestions = [
  "Explain Binary Search Tree simply",
  "What are ACID properties?",
  "Difference between TCP and UDP",
  "Explain Fundamental Rights in India",
  "What is deadlock in OS?",
  "Explain normalization in DBMS",
];

/* Mock AI response generator - will be replaced with real AI integration */
const getMockResponse = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes("binary search"))
    return `## Binary Search Tree (BST)\n\nA BST is a tree data structure where:\n- **Left child** < Parent\n- **Right child** > Parent\n\n### Example\n\`\`\`\n      8\n     / \\\\\n    3   10\n   / \\\\    \\\\\n  1   6   14\n\`\`\`\n\n### Operations\n| Operation | Average | Worst |\n|-----------|---------|-------|\n| Search    | O(log n)| O(n)  |\n| Insert    | O(log n)| O(n)  |\n| Delete    | O(log n)| O(n)  |\n\n💡 **Tip:** The worst case happens when the tree is skewed (like a linked list).`;
  if (q.includes("acid"))
    return `## ACID Properties\n\nACID ensures reliable database transactions:\n\n1. **Atomicity** – All or nothing. If one part fails, the entire transaction rolls back.\n2. **Consistency** – Database moves from one valid state to another.\n3. **Isolation** – Concurrent transactions don't interfere with each other.\n4. **Durability** – Once committed, data survives crashes.\n\n### Real-world Example\nThink of a bank transfer: ₹500 from A to B.\n- Atomicity: Both debit and credit must happen\n- Consistency: Total money stays the same\n- Isolation: Other transfers don't mix up\n- Durability: Transfer saved even if power goes out`;
  if (q.includes("deadlock"))
    return `## Deadlock in Operating Systems\n\nDeadlock occurs when processes are **waiting for each other** in a cycle, and none can proceed.\n\n### 4 Necessary Conditions\n1. **Mutual Exclusion** – Resource held exclusively\n2. **Hold and Wait** – Holding one, waiting for another\n3. **No Preemption** – Can't force release\n4. **Circular Wait** – A→B→C→A cycle\n\n### Prevention\nBreak any one condition to prevent deadlock!\n\n💡 **Simple analogy:** Two people at a narrow door, each waiting for the other to go first.`;
  return `Great question! Here's what I know about that topic:\n\nThis is a **demo response**. When connected to the AI backend, I'll provide detailed, personalized explanations with examples, diagrams, and practice questions.\n\n### What I can help with:\n- 📚 CS subjects (DSA, OS, DBMS, Networks)\n- 🏛️ UPSC topics (Polity, History, Geography)\n- 🧮 Problem solving & code explanations\n\nTry asking something specific!`;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom when messages change */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    /* Simulate AI response delay */
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getMockResponse(text),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="gradient-primary rounded-2xl p-4 mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">AI Study Tutor</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              Ask me anything about your subjects. I'll explain concepts simply with
              examples and analogies.
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs hover:bg-muted/80 transition-colors border border-border"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mt-1">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "glass-card"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-secondary prose-code:bg-muted prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="glass-card rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-3 border-t border-border"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your subjects..."
          className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
          disabled={isTyping}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="gradient-primary text-primary-foreground rounded-xl px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
