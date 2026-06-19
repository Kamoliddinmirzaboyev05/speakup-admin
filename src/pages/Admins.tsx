import { useState } from "react";
import {
  ShieldCheck, Shield, Plus, KeyRound, Trash2, X, CheckCircle,
  Loader2, Ban, RotateCw,
} from "lucide-react";
import {
  useAdmins, useCreateAdmin, useUpdateAdmin, useDeleteAdmin,
} from "@/hooks/queries";
import type { AdminAccount, AdminRole } from "@/services/admins";
import { useAuthStore } from "@/store/authStore";

function errMsg(e: unknown, fallback: string): string {
  const detail = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

const roleBadge: Record<AdminRole, string> = {
  superadmin: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  admin: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
      {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Create Admin Modal ─────────────────────────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const create = useCreateAdmin();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await create.mutateAsync({ email, name: name || "Admin", password, role });
      setDone(true);
      setTimeout(onClose, 900);
    } catch (err) {
      setError(errMsg(err, "Could not create admin"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Add Admin</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle size={32} className="text-emerald-400" />
            <p className="text-sm text-foreground">Admin created!</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Field label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputCls} placeholder="admin@example.com" />
            </Field>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)}
                className={inputCls} placeholder="Full name" />
            </Field>
            <Field label="Password (min 6)">
              <input type="text" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputCls} placeholder="••••••••" />
            </Field>
            <Field label="Role">
              <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)} className={inputCls}>
                <option value="admin">admin</option>
                <option value="superadmin">superadmin</option>
              </select>
            </Field>
            {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button type="submit" disabled={create.isPending}
                className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {create.isPending && <Loader2 size={13} className="animate-spin" />} Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Change Password Modal ──────────────────────────────────────────────────
function PasswordModal({ admin, onClose }: { admin: AdminAccount; onClose: () => void }) {
  const update = useUpdateAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await update.mutateAsync({ id: admin.id, input: { password } });
      setDone(true);
      setTimeout(onClose, 900);
    } catch (err) {
      setError(errMsg(err, "Could not change password"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle size={32} className="text-emerald-400" />
            <p className="text-sm text-foreground">Password updated!</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-xs text-muted-foreground">For <span className="text-foreground font-medium">{admin.email}</span></p>
            <Field label="New password (min 6)">
              <input type="text" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputCls} placeholder="New password" />
            </Field>
            {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button type="submit" disabled={update.isPending}
                className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {update.isPending && <Loader2 size={13} className="animate-spin" />} Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function Admins() {
  const { data, isLoading, error } = useAdmins();
  const update = useUpdateAdmin();
  const del = useDeleteAdmin();
  const me = useAuthStore((s) => s.admin);
  const [createOpen, setCreateOpen] = useState(false);
  const [pwAdmin, setPwAdmin] = useState<AdminAccount | null>(null);

  const forbidden = (error as { response?: { status?: number } })?.response?.status === 403;

  const toggleActive = (a: AdminAccount) =>
    update.mutate({ id: a.id, input: { is_active: !a.is_active } });

  const toggleRole = (a: AdminAccount) =>
    update.mutate({ id: a.id, input: { role: a.role === "superadmin" ? "admin" : "superadmin" } });

  const remove = (a: AdminAccount) => {
    if (confirm(`Delete admin ${a.email}?`)) del.mutate(a.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{data?.length ?? 0} admin account(s)</p>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} /> Add Admin
        </button>
      </div>

      {forbidden && (
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4 text-xs text-amber-400">
          Only a <b>superadmin</b> can manage admin accounts. Your role is <b>{me?.role}</b>.
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Admin", "Email", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 size={18} className="animate-spin inline" />
                </td></tr>
              )}
              {!isLoading && (data ?? []).map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.name} />
                      <span className="font-medium text-foreground">
                        {a.name}{me?.id === String(a.id) && <span className="text-muted-foreground"> (you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{a.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${roleBadge[a.role]}`}>
                      {a.role === "superadmin" ? <ShieldCheck size={9} /> : <Shield size={9} />} {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${a.is_active ? "text-emerald-400 bg-emerald-400/10" : "text-muted-foreground bg-muted/50"}`}>
                      {a.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPwAdmin(a)} title="Change password" className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><KeyRound size={13} /></button>
                      <button onClick={() => toggleRole(a)} title="Toggle role" className="p-1.5 rounded hover:bg-purple-400/10 text-muted-foreground hover:text-purple-400 transition-colors"><RotateCw size={13} /></button>
                      <button onClick={() => toggleActive(a)} disabled={me?.id === String(a.id)} title={a.is_active ? "Disable" : "Enable"} className="p-1.5 rounded hover:bg-amber-400/10 text-muted-foreground hover:text-amber-400 disabled:opacity-30 transition-colors"><Ban size={13} /></button>
                      <button onClick={() => remove(a)} disabled={me?.id === String(a.id)} title="Delete" className="p-1.5 rounded hover:bg-red-400/10 text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !forbidden && (data ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No admins</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} />}
      {pwAdmin && <PasswordModal admin={pwAdmin} onClose={() => setPwAdmin(null)} />}
    </div>
  );
}
