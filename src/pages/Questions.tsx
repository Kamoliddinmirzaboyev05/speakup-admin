import { useState } from "react";
import {
  Plus, Trash2, Pencil, X, ListChecks, Loader2, Check, EyeOff, Eye,
} from "lucide-react";
import {
  useGroups, useGroupMutations, useQuestions, useQuestionMutations,
} from "@/hooks/queries";
import type { TopicGroup } from "@/services/content";

const PARTS = [
  { n: 1, label: "Part 1", color: "bg-emerald-500", ring: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
  { n: 2, label: "Part 2", color: "bg-blue-500", ring: "border-blue-500 text-blue-400 bg-blue-500/10" },
  { n: 3, label: "Part 3", color: "bg-orange-500", ring: "border-orange-500 text-orange-400 bg-orange-500/10" },
];

const inputCls = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40";

// ── Questions modal for a group ──────────────────────────────────────────────
function QuestionsModal({ group, onClose }: { group: TopicGroup; onClose: () => void }) {
  const { data, isLoading } = useQuestions(group.id);
  const m = useQuestionMutations(group.id);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const add = async () => {
    if (!text.trim()) return;
    await m.create.mutateAsync(text.trim());
    setText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Savollar</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{group.title}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-2 max-h-[55vh] overflow-y-auto">
          {isLoading && <div className="text-center text-muted-foreground py-4"><Loader2 size={16} className="animate-spin inline" /></div>}
          {(data ?? []).map((q, i) => (
            <div key={q.id} className="flex items-start gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2">
              <span className="text-[10px] text-muted-foreground mt-1 w-4">{i + 1}</span>
              {editId === q.id ? (
                <>
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} className={inputCls} autoFocus />
                  <button onClick={async () => { await m.update.mutateAsync({ id: q.id, text: editText.trim() }); setEditId(null); }} className="p-1.5 text-emerald-400"><Check size={14} /></button>
                  <button onClick={() => setEditId(null)} className="p-1.5 text-muted-foreground"><X size={14} /></button>
                </>
              ) : (
                <>
                  <p className="flex-1 text-xs text-foreground">{q.text}</p>
                  <button onClick={() => { setEditId(q.id); setEditText(q.text); }} className="p-1 text-muted-foreground hover:text-primary"><Pencil size={13} /></button>
                  <button onClick={() => m.remove.mutate(q.id)} className="p-1 text-muted-foreground hover:text-red-500"><Trash2 size={13} /></button>
                </>
              )}
            </div>
          ))}
          {!isLoading && (data ?? []).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Savol yo'q</p>}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Yangi savol matni…" className={inputCls} />
          <button onClick={add} disabled={m.create.isPending} className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1">
            <Plus size={13} /> Qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Group create/edit modal ──────────────────────────────────────────────────
function GroupModal({ part, group, onClose }: { part: number; group: TopicGroup | null; onClose: () => void }) {
  const m = useGroupMutations();
  const [title, setTitle] = useState(group?.title ?? "");
  const [tag, setTag] = useState(group?.tag ?? "");

  const save = async () => {
    if (!title.trim()) return;
    if (group) await m.update.mutateAsync({ id: group.id, d: { title: title.trim(), tag: tag.trim() || null } });
    else await m.create.mutateAsync({ part, title: title.trim(), tag: tag.trim() || null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{group ? "Guruhni tahrirlash" : `Part ${part} — yangi guruh`}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Sarlavha</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Masalan: Work and studies" autoFocus />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Teg (ixtiyoriy)</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} className={inputCls} placeholder="Free answers / NEW TOPIC / sana" />
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground">Bekor</button>
            <button onClick={save} disabled={m.create.isPending || m.update.isPending} className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-60">Saqlash</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Questions() {
  const [part, setPart] = useState(1);
  const { data, isLoading } = useGroups(part);
  const m = useGroupMutations();
  const [qGroup, setQGroup] = useState<TopicGroup | null>(null);
  const [editGroup, setEditGroup] = useState<TopicGroup | null>(null);
  const [creating, setCreating] = useState(false);

  const pc = PARTS.find((p) => p.n === part)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-secondary/50 border border-border rounded-xl p-1 flex">
          {PARTS.map((p) => (
            <button key={p.n} onClick={() => setPart(p.n)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${part === p.n ? `${p.color} text-white` : "text-muted-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90">
          <Plus size={14} /> Guruh qo'shish
        </button>
      </div>

      <div className="space-y-2">
        {isLoading && <div className="text-center text-muted-foreground py-8"><Loader2 size={18} className="animate-spin inline" /></div>}
        {!isLoading && (data ?? []).map((g, i) => (
          <div key={g.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${pc.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground">{g.title}</p>
                {g.tag && <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${pc.ring}`}>{g.tag}</span>}
                {!g.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">yashirin</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{g.question_count} ta savol</p>
            </div>
            <button onClick={() => setQGroup(g)} title="Savollar" className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"><ListChecks size={15} /></button>
            <button onClick={() => m.update.mutate({ id: g.id, d: { is_active: !g.is_active } })} title={g.is_active ? "Yashirish" : "Ko'rsatish"} className="p-2 rounded-lg hover:bg-amber-400/10 text-muted-foreground hover:text-amber-400">{g.is_active ? <Eye size={15} /> : <EyeOff size={15} />}</button>
            <button onClick={() => setEditGroup(g)} title="Tahrirlash" className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil size={15} /></button>
            <button onClick={() => { if (confirm(`"${g.title}" guruhini o'chirasizmi?`)) m.remove.mutate(g.id); }} title="O'chirish" className="p-2 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-500"><Trash2 size={15} /></button>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Bu partда guruh yo'q. "Guruh qo'shish" bosing.</p>}
      </div>

      {qGroup && <QuestionsModal group={qGroup} onClose={() => setQGroup(null)} />}
      {(creating || editGroup) && <GroupModal part={part} group={editGroup} onClose={() => { setCreating(false); setEditGroup(null); }} />}
    </div>
  );
}
