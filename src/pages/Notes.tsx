import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Plus, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  subject: string | null;
  created_at: string;
}

const subjects = ["DSA", "OS", "DBMS", "Networks", "Polity", "History"];

const Notes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSubject, setNewSubject] = useState("DSA");
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch notes from database
  useEffect(() => {
    if (!user) return;
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setNotes(data);
      setLoading(false);
    };
    fetchNotes();
  }, [user]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newContent.trim() || !user) return;
    const { data, error } = await supabase
      .from("notes")
      .insert({ title: newTitle, content: newContent, subject: newSubject, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    if (data) setNotes((prev) => [data, ...prev]);
    setNewTitle("");
    setNewContent("");
    setShowAdd(false);
  };

  const handleSummarize = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setSummarizingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-notes", {
        body: { content: note.content, mode: "short" },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Update in database
      await supabase.from("notes").update({ summary: data.summary }).eq("id", id);
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, summary: data.summary } : n)));
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSummarizingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Your Notes</h2>
          <p className="text-sm text-muted-foreground">Upload notes and let AI summarize them</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add Note
        </Button>
      </div>

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
                    newSubject === s ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="gradient-primary text-primary-foreground">Save Note</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {notes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No notes yet. Add your first note!</p>
          </div>
        )}
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
                <h3 className="font-semibold text-foreground text-sm">{note.title}</h3>
                {note.subject && (
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{note.subject}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleCopy(note.summary || note.content, note.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  {copiedId === note.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{note.content}</p>

            {note.summary ? (
              <div className="mt-4 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  <span className="text-xs font-medium text-secondary">AI Summary</span>
                </div>
                <p className="text-sm text-foreground">{note.summary}</p>
              </div>
            ) : (
              <button
                onClick={() => handleSummarize(note.id)}
                disabled={summarizingId === note.id}
                className="mt-3 flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 font-medium"
              >
                {summarizingId === note.id ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Summarizing...</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Summarize with AI</>
                )}
              </button>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              {new Date(note.created_at).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
