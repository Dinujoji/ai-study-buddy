import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Plus, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/* Types for notes */
interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  subject: string;
  createdAt: Date;
}

/* Mock notes for demo */
const initialNotes: Note[] = [
  {
    id: "1",
    title: "Binary Trees Basics",
    content:
      "A binary tree is a tree data structure where each node has at most two children. The left subtree contains nodes with values less than the parent, and the right subtree contains nodes with values greater than the parent.",
    summary:
      "Binary tree = each node has max 2 children. Left < Parent < Right. Used for efficient searching and sorting.",
    subject: "DSA",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "2",
    title: "Fundamental Rights - Article 14-32",
    content:
      "Fundamental Rights are enshrined in Part III of the Indian Constitution (Articles 12-35). They guarantee civil liberties to all citizens. Right to Equality (14-18), Right to Freedom (19-22), Right against Exploitation (23-24), Right to Freedom of Religion (25-28), Cultural and Educational Rights (29-30), Right to Constitutional Remedies (32).",
    summary:
      "Part III, Articles 12-35. 6 categories: Equality, Freedom, Against Exploitation, Religion, Cultural/Educational, Constitutional Remedies. Article 32 is the 'heart and soul' of the Constitution.",
    subject: "Polity",
    createdAt: new Date("2024-03-14"),
  },
];

/* Simulated AI summarization */
const generateSummary = (content: string): string => {
  const words = content.split(" ");
  if (words.length <= 20) return content;
  return (
    words.slice(0, Math.ceil(words.length * 0.4)).join(" ") +
    "... [AI Summary: Key points extracted and simplified]"
  );
};

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSubject, setNewSubject] = useState("DSA");
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const subjects = ["DSA", "OS", "DBMS", "Networks", "Polity", "History"];

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      summary: null,
      subject: newSubject,
      createdAt: new Date(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewTitle("");
    setNewContent("");
    setShowAdd(false);
  };

  const handleSummarize = (id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, summary: generateSummary(n.content) } : n
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Your Notes</h2>
          <p className="text-sm text-muted-foreground">
            Upload notes and let AI summarize them for you
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="gradient-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {/* Add note form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-xl p-5 space-y-4"
          >
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title"
              className="w-full bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
            <div className="flex gap-2 flex-wrap">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setNewSubject(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    newSubject === s
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Paste or type your notes here..."
              rows={6}
              className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdd(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                className="gradient-primary text-primary-foreground"
              >
                Save Note
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes list */}
      <div className="space-y-4">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-secondary" />
                <h3 className="font-semibold text-foreground text-sm">
                  {note.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                  {note.subject}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(note.summary || note.content, note.id)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  title="Copy"
                >
                  {copiedId === note.id ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {note.content}
            </p>

            {/* AI Summary section */}
            {note.summary ? (
              <div className="mt-4 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  <span className="text-xs font-medium text-secondary">
                    AI Summary
                  </span>
                </div>
                <p className="text-sm text-foreground">{note.summary}</p>
              </div>
            ) : (
              <button
                onClick={() => handleSummarize(note.id)}
                className="mt-3 flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Summarize with AI
              </button>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              {note.createdAt.toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
