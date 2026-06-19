import { useState } from "react";
import {
  Plus, Trash2, Pencil, X, Loader2, Check, EyeOff, Eye,
  ChevronDown, ChevronRight,
} from "lucide-react";
import {
  useGroups, useGroupMutations, useQuestions, useQuestionMutations,
} from "@/hooks/queries";
import { SkeletonListRows } from "@/components/Skeleton";
import type { TopicGroup } from "@/services/content";

const PARTS = [
  { n: 1, label: "Part 1", color: "bg-emerald-500", ring: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
  { n: 2, label: "Part 2", color: "bg-blue-500", ring: "border-blue-500 text-blue-400 bg-blue-500/10" },
  { n: 3, label: "Part 3", color: "bg-orange-500", ring: "border-orange-500 text-orange-400 bg-orange-500/10" },
];

const inputCls = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40";

// ── Inline questions editor (expands inside a group card) ─────────────────────
function QuestionsEditor({ group }: { group: TopicGroup }) {
  const { data, isLoading } = useQuestions(group.id);
  const m = useQuestionMutations(group.id);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const add = async () => {
    const t = text.trim();
    if (!t) return;
    await m.create.mutateAsync(t);
    setText(""); // keep focus to add the next one fast
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
      {isLoading && <div className="text-center text-muted-foreground py-3"><Loader2 size={15} className="animate-spin inline" /></div>}
      {(data ?? []).map((q, i) => (
        <div key={q.id} className="flex items-start gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2">
          <span className="text-[10px] text-muted-foreground mt-1.5 w-4 shrink-0">{i + 1}</span>
          {editId === q.id ? (
            <>
              <input
                value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus className={inputCls}
                onKeyDown={async (e) => { if (e.key === "Enter") { await m.update.mutateAsync({ id: q.id, text: editText.trim() }); setEditId(null); } if (e.key === "Escape") setEditId(null); }}
              />
              <button onClick={async () => { await m.update.mutateAsync({ id: q.id, text: editText.trim() }); setEditId(null); }} className="p-1.5 text-emerald-400"><Check size={14} /></button>
              <button onClick={() => setEditId(null)} className="p-1.5 text-muted-foreground"><X size={14} /></button>
            </>
          ) : (
            <>
              <p className="flex-1 text-xs text-foreground py-0.5">{q.text}</p>
              <button onClick={() => { setEditId(q.id); setEditText(q.text); }} className="p-1 text-muted-foreground hover:text-primary"><Pencil size={13} /></button>
              <button onClick={() => m.remove.mutate(q.id)} className="p-1 text-muted-foreground hover:text-red-500"><Trash2 size={13} /></button>
            </>
          )}
        </div>
      ))}
      {!isLoading && (data ?? []).length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Hali savol yo'q — pastdan qo'shing.</p>}

      {/* Fast inline add: type + Enter adds and clears for the next */}
      <div className="flex gap-2 pt-1">
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Savol yozing va Enter bosing…" className={inputCls}
        />
        <button onClick={add} disabled={m.create.isPending || !text.trim()} className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1 shrink-0">
          {m.create.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Qo'shish
        </button>
      </div>
    </div>
  );
}

// ── Group create/edit modal ──────────────────────────────────────────────────
function GroupModal({ group, onClose }: { group: TopicGroup; onClose: () => void }) {
  const m = useGroupMutations();
  const [title, setTitle] = useState(group.title);
  const [tag, setTag] = useState(group.tag ?? "");

  const save = async () => {
    if (!title.trim()) return;
    await m.update.mutateAsync({ id: group.id, d: { title: title.trim(), tag: tag.trim() || null } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Guruhni tahrirlash</h3>
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
            <button onClick={save} disabled={m.update.isPending} className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-60">Saqlash</button>
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
  const [editGroup, setEditGroup] = useState<TopicGroup | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Inline "add group" — type a title, Enter or click to create instantly.
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("");

  const pc = PARTS.find((p) => p.n === part)!;

  const addGroup = async () => {
    const t = newTitle.trim();
    if (!t) return;
    const created = await m.create.mutateAsync({ part, title: t, tag: newTag.trim() || null });
    setNewTitle("");
    setNewTag("");
    // open the new group so the admin can immediately add questions
    if (created?.id) setExpanded(created.id);
  };

  return (
    <div className="space-y-4">
      {/* Part tabs */}
      <div className="bg-secondary/50 border border-border rounded-xl p-1 inline-flex">
        {PARTS.map((p) => (
          <button key={p.n} onClick={() => { setPart(p.n); setExpanded(null); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${part === p.n ? `${p.color} text-white` : "text-muted-foreground"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Inline add-group bar */}
      <div className="bg-card border border-border rounded-xl p-3 flex flex-col sm:flex-row gap-2">
        <input
          value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGroup()}
          placeholder={`Part ${part} uchun yangi guruh nomi…`} className={`${inputCls} flex-1`}
        />
        <input
          value={newTag} onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGroup()}
          placeholder="Teg (ixtiyoriy)" className={`${inputCls} sm:w-44`}
        />
        <button onClick={addGroup} disabled={m.create.isPending || !newTitle.trim()} className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0">
          {m.create.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />} Guruh qo'shish
        </button>
      </div>

      {/* Groups list */}
      <div className="space-y-2">
        {isLoading && <SkeletonListRows rows={5} />}
        {!isLoading && (data ?? []).map((g, i) => {
          const isOpen = expanded === g.id;
          return (
            <div key={g.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setExpanded(isOpen ? null : g.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className={`w-8 h-8 rounded-full ${pc.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>{i + 1}</div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(isOpen ? null : g.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{g.title}</p>
                    {g.tag && <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${pc.ring}`}>{g.tag}</span>}
                    {!g.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">yashirin</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.question_count} ta savol</p>
                </div>
                <button onClick={() => m.update.mutate({ id: g.id, d: { is_active: !g.is_active } })} title={g.is_active ? "Yashirish" : "Ko'rsatish"} className="p-2 rounded-lg hover:bg-amber-400/10 text-muted-foreground hover:text-amber-400">{g.is_active ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button onClick={() => setEditGroup(g)} title="Tahrirlash" className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil size={15} /></button>
                <button onClick={() => { if (confirm(`"${g.title}" guruhini o'chirasizmi?`)) m.remove.mutate(g.id); }} title="O'chirish" className="p-2 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-500"><Trash2 size={15} /></button>
              </div>
              {isOpen && <QuestionsEditor group={g} />}
            </div>
          );
        })}
        {!isLoading && (data ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Bu partda guruh yo'q. Yuqoridagi maydondan qo'shing.</p>}
      </div>

      {editGroup && <GroupModal group={editGroup} onClose={() => setEditGroup(null)} />}
    </div>
  );
}
