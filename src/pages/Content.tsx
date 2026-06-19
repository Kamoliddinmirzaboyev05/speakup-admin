import { useState, useMemo, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, X, CheckCircle, BookOpen } from "lucide-react";
import { useQuestions } from "@/hooks/queries";
import type { Question, UserLevel } from "../types";

const LEVELS: UserLevel[] = ["beginner", "intermediate", "advanced"];
const levelBadge: Record<UserLevel, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};
const levelTab: Record<UserLevel, string> = {
  beginner: "text-emerald-400 border-emerald-400",
  intermediate: "text-amber-400 border-amber-400",
  advanced: "text-purple-400 border-purple-400",
};

function QuestionModal({
  question,
  onClose,
  onSave,
}: {
  question: Partial<Question> | null;
  onClose: () => void;
  onSave: (q: Question) => void;
}) {
  const isNew = !question?.id;
  const [form, setForm] = useState<Partial<Question>>({
    topic: "", level: "beginner", prompt: "", aiPrompt: "", category: "", isActive: true,
    ...question,
  });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof Question, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handle = () => {
    setSaved(true);
    setTimeout(() => {
      onSave({
        id: question?.id ?? `qst_${Date.now()}`,
        topic: form.topic ?? "",
        level: form.level ?? "beginner",
        prompt: form.prompt ?? "",
        aiPrompt: form.aiPrompt ?? "",
        category: form.category ?? form.topic ?? "",
        isActive: form.isActive ?? true,
        createdAt: question?.createdAt ?? new Date().toISOString(),
        usageCount: question?.usageCount ?? 0,
      });
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{isNew ? "Add Question" : "Edit Question"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
        {saved ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <CheckCircle size={32} className="text-emerald-400" />
            <p className="text-sm text-foreground">{isNew ? "Question added!" : "Changes saved!"}</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Topic / Title</label>
                <input value={form.topic} onChange={(e) => set("topic", e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="e.g. Daily Routines" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Level</label>
                <select value={form.level} onChange={(e) => set("level", e.target.value as UserLevel)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer">
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">User Prompt (what the user sees)</label>
              <textarea value={form.prompt} onChange={(e) => set("prompt", e.target.value)} rows={3}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                placeholder="Describe your morning routine in detail…" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">AI System Prompt</label>
              <textarea value={form.aiPrompt} onChange={(e) => set("aiPrompt", e.target.value)} rows={3}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                placeholder="Instructions for the AI partner…" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground">Active</label>
              <button onClick={() => set("isActive", !form.isActive)}
                className={`w-10 h-5 rounded-full transition-all relative ${form.isActive ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handle} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                {isNew ? "Add Question" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Content() {
  const { data } = useQuestions();
  const [questions, setQuestions] = useState<Question[]>([]);
  useEffect(() => { if (data) setQuestions(data); }, [data]);
  const [activeLevel, setActiveLevel] = useState<UserLevel>("beginner");
  const [search, setSearch] = useState("");
  const [editQuestion, setEditQuestion] = useState<Partial<Question> | null | undefined>(undefined);

  const filtered = useMemo(() =>
    questions.filter((q) => {
      if (q.level !== activeLevel) return false;
      if (search && !`${q.topic} ${q.prompt}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [questions, activeLevel, search]
  );

  const counts = useMemo(() => {
    const c: Record<UserLevel, number> = { beginner: 0, intermediate: 0, advanced: 0 };
    questions.forEach((q) => c[q.level]++);
    return c;
  }, [questions]);

  const handleSave = (q: Question) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((x) => x.id === q.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = q; return next; }
      return [...prev, q];
    });
  };

  const toggleActive = (id: string) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, isActive: !q.isActive } : q));
  };

  const deleteQuestion = (id: string) => {
    if (confirm("Delete this question?")) setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Level tabs */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit">
        {LEVELS.map((l) => (
          <button key={l} onClick={() => setActiveLevel(l)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
              ${activeLevel === l ? `${levelTab[l]} border-b-2 bg-muted/60` : "text-muted-foreground hover:text-foreground"}`}>
            {l.charAt(0).toUpperCase() + l.slice(1)}
            <span className="text-[10px] font-mono opacity-60">({counts[l]})</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2 flex-1">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics or prompts…"
            className="bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground flex-1" />
          {search && <button onClick={() => setSearch("")}><X size={12} className="text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setEditQuestion(null)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} /> Add Question
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((q) => (
          <div key={q.id} className={`bg-card border rounded-xl p-4 flex flex-col gap-3 transition-colors ${q.isActive ? "border-border hover:border-primary/20" : "border-border/40 opacity-60"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-foreground">{q.topic}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${levelBadge[q.level]}`}>
                {q.level.slice(0, 3).toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{q.prompt}</p>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
              <div className="text-[10px] text-muted-foreground/70 mb-1">AI Prompt</div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{q.aiPrompt}</p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-[10px] text-muted-foreground font-mono">Used {q.usageCount.toLocaleString()}×</div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(q.id)} title={q.isActive ? "Deactivate" : "Activate"}
                  className={`p-1.5 rounded transition-colors ${q.isActive ? "text-emerald-400 hover:bg-emerald-400/10" : "text-muted-foreground hover:bg-muted/60"}`}>
                  {q.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => setEditQuestion(q)} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => deleteQuestion(q.id)} className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={28} className="text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No questions found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add one to get started</p>
          </div>
        )}
      </div>

      {editQuestion !== undefined && (
        <QuestionModal
          question={editQuestion}
          onClose={() => setEditQuestion(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
