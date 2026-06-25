import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Link2,
  Megaphone,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  broadcastService,
  type BroadcastAudience,
  type BroadcastAudienceCounts,
  type BroadcastResult,
} from "@/services/broadcast";
import { adminService } from "@/services/admin";
import type { AdminUser } from "@/types";
import { TEMPLATES, type ButtonMode } from "./broadcastTemplates";

const MAX_PHOTO_MB = 6;
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;
const CAPTION_LIMIT = 1024;
const MESSAGE_LIMIT = 3900;

const inputCls =
  "w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/70 disabled:opacity-60";
const labelCls = "text-xs font-medium text-muted-foreground";
const cardCls = "bg-card border border-border rounded-lg";

const AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
  onboarded: "Onboardingdan o'tganlar",
  not_onboarded: "Onboardingdan o'tmaganlar",
  all: "Barcha foydalanuvchilar",
  selected: "Tanlangan foydalanuvchilar",
};

const EMOJIS = ["🎙", "🔥", "✨", "🚀", "✅", "🎯", "📣", "💬", "⭐", "⏰"];

function splitParagraphs(text: string) {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

function countForAudience(counts: BroadcastAudienceCounts | undefined, audience: BroadcastAudience) {
  if (audience === "selected") return 0;
  return counts ? counts[audience] : 0;
}

function userDisplayName(user: AdminUser) {
  return user.first_name || (user.username ? `@${user.username}` : `#${user.id}`);
}

function isSafeButtonUrl(url: string) {
  const trimmed = url.trim();
  return !trimmed || /^(https?:\/\/|tg:\/\/)/i.test(trimmed);
}

function htmlLength(title: string, body: string) {
  const paragraphs = splitParagraphs(body);
  const titleLength = title.trim().length + 7;
  const bodyLength = paragraphs.length ? 2 + paragraphs.join("\n\n").length : 0;
  return titleLength + bodyLength;
}

function ResultBox({ result }: { result: BroadcastResult }) {
  return (
    <div className={cardCls}>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <CheckCircle2 size={16} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-foreground">Yuborish natijasi</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="text-lg font-bold font-mono text-foreground">{result.eligible}</div>
          <div className="text-[11px] text-muted-foreground">audience</div>
        </div>
        <div className="bg-emerald-500/10 rounded-lg p-3">
          <div className="text-lg font-bold font-mono text-emerald-400">{result.sent}</div>
          <div className="text-[11px] text-muted-foreground">sent</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3">
          <div className="text-lg font-bold font-mono text-red-400">{result.failed}</div>
          <div className="text-[11px] text-muted-foreground">failed</div>
        </div>
      </div>
      {result.failures.length > 0 && (
        <pre className="mx-4 mb-4 text-[11px] text-muted-foreground bg-background rounded-lg p-3 overflow-x-auto">
          {result.failures.join("\n")}
        </pre>
      )}
    </div>
  );
}

export default function Broadcast() {
  const [audience, setAudience] = useState<BroadcastAudience>("onboarded");
  const [title, setTitle] = useState<string>(TEMPLATES[0].title);
  const [body, setBody] = useState<string>(TEMPLATES[0].body);
  const [buttonText, setButtonText] = useState<string>(TEMPLATES[0].buttonText);
  const [buttonUrl, setButtonUrl] = useState<string>(TEMPLATES[0].buttonUrl);
  const [buttonMode, setButtonMode] = useState<ButtonMode>(TEMPLATES[0].buttonMode);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);

  const countsQuery = useQuery({
    queryKey: ["broadcast", "audience-counts"],
    queryFn: broadcastService.counts,
    staleTime: 20_000,
  });
  const usersQuery = useQuery({
    queryKey: ["broadcast", "user-search", userSearch],
    queryFn: () => adminService.getUsers({ search: userSearch || undefined, limit: 8, offset: 0 }),
    enabled: audience === "selected",
    staleTime: 10_000,
  });

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : ""), [photo]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const paragraphs = splitParagraphs(body);
  const selectedCount = audience === "selected" ? selectedUsers.length : countForAudience(countsQuery.data, audience);
  const estimatedLength = htmlLength(title, body);
  const usesFollowupMessage = Boolean(photo) && estimatedLength > CAPTION_LIMIT;
  const hasButtonHalf = Boolean(buttonText.trim()) !== Boolean(buttonUrl.trim());
  const urlIsSafe = isSafeButtonUrl(buttonUrl);
  const webAppUrlIsSafe = buttonMode !== "web_app" || !buttonUrl.trim() || buttonUrl.trim().startsWith("https://");
  const confirmOk = confirmText.trim().toUpperCase() === "SEND";

  const sendMutation = useMutation({
    mutationFn: () =>
      broadcastService.send({
        audience,
        title,
        body,
        button_text: buttonText,
        button_url: buttonUrl,
        button_mode: buttonMode,
        selected_user_ids: audience === "selected" ? selectedUsers.map((user) => user.id) : undefined,
        photo,
      }),
    onSuccess: (data) => {
      setResult(data);
      setConfirmText("");
      countsQuery.refetch();
    },
  });

  const canSend =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    estimatedLength <= MESSAGE_LIMIT &&
    !hasButtonHalf &&
    urlIsSafe &&
    webAppUrlIsSafe &&
    (audience !== "selected" || selectedUsers.length > 0) &&
    !photoError &&
    confirmOk &&
    !sendMutation.isPending;

  const applyTemplate = (template: (typeof TEMPLATES)[number]) => {
    setTitle(template.title);
    setBody(template.body);
    setButtonText(template.buttonText);
    setButtonUrl(template.buttonUrl);
    setButtonMode(template.buttonMode);
    if ("audience" in template && template.audience) setAudience(template.audience);
    setConfirmText("");
    setResult(null);
  };

  const addEmoji = (emoji: string) => {
    setBody((current) => `${current}${current.endsWith(" ") || current.endsWith("\n") ? "" : " "}${emoji}`);
  };

  const addSelectedUser = (user: AdminUser) => {
    setSelectedUsers((current) => current.some((item) => item.id === user.id) ? current : [...current, user]);
  };

  const removeSelectedUser = (id: number) => {
    setSelectedUsers((current) => current.filter((user) => user.id !== id));
  };

  const onPhotoChange = (file: File | null) => {
    setPhotoError("");
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhoto(null);
      setPhotoError("Faqat rasm fayl yuklang.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhoto(null);
      setPhotoError(`Rasm ${MAX_PHOTO_MB} MB dan katta bo'lmasin.`);
      return;
    }
    setPhoto(file);
  };

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_440px] gap-5">
      <form
        className={`${cardCls} p-5 space-y-5`}
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) sendMutation.mutate();
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-foreground">Bot xabarlari</h2>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground"
                >
                  <span>{template.icon}</span>
                  {template.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 min-w-[260px]">
            {(["onboarded", "not_onboarded", "selected", "all"] as BroadcastAudience[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className={`rounded-lg border px-2 py-2 text-left ${
                  audience === key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="text-sm font-bold font-mono">
                  {key === "selected" ? selectedUsers.length : countsQuery.isLoading ? "..." : countForAudience(countsQuery.data, key)}
                </div>
                <div className="text-[10px] leading-tight">
                  {key === "not_onboarded" ? "not onboarded" : key}
                </div>
              </button>
            ))}
          </div>
        </div>

        {audience === "selected" && (
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <label className="space-y-1.5 block">
              <span className={labelCls}>User qidirish</span>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Ism, username yoki Telegram ID"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </label>

            <div className="grid lg:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-[11px] font-medium text-muted-foreground">Natijalar</div>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {(usersQuery.data?.items ?? []).map((user) => {
                    const selected = selectedUsers.some((item) => item.id === user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        disabled={selected}
                        onClick={() => addSelectedUser(user)}
                        className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-left disabled:opacity-45 hover:border-primary/50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-foreground">{userDisplayName(user)}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            ID: {user.telegram_id}{user.username ? ` · @${user.username}` : ""}
                          </span>
                        </span>
                        <span className="text-[11px] text-primary">{selected ? "selected" : "add"}</span>
                      </button>
                    );
                  })}
                  {usersQuery.isLoading && <div className="text-xs text-muted-foreground">Qidirilmoqda...</div>}
                  {!usersQuery.isLoading && (usersQuery.data?.items ?? []).length === 0 && (
                    <div className="text-xs text-muted-foreground">User topilmadi.</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-medium text-muted-foreground">Tanlanganlar</div>
                <div className="min-h-24 rounded-lg border border-border bg-background/40 p-2 space-y-1.5">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5">
                      <span className="min-w-0">
                        <span className="block truncate text-xs text-foreground">{userDisplayName(user)}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">ID: {user.telegram_id}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSelectedUser(user.id)}
                        className="shrink-0 text-muted-foreground hover:text-red-400"
                        aria-label="Remove selected user"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  {selectedUsers.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2">
                      Kamida bitta user tanlang.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_260px] gap-4">
          <label className="space-y-1.5">
            <span className={labelCls}>Sarlavha</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className={inputCls}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelCls}>Rasm</span>
            <div className="flex items-center gap-2">
              <label className="min-w-0 flex-1 border border-dashed border-border rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 cursor-pointer flex items-center gap-2">
                <ImagePlus size={15} />
                <span className="truncate">{photo ? photo.name : "Image upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
                />
              </label>
              {photo && (
                <button
                  type="button"
                  onClick={() => onPhotoChange(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                  aria-label="Remove image"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            {photoError && <p className="text-xs text-red-400">{photoError}</p>}
          </label>
        </div>

        <label className="space-y-1.5 block">
          <span className={labelCls}>Matn</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            maxLength={3500}
            className={`${inputCls} resize-none leading-6`}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="h-8 w-8 rounded-lg border border-border bg-muted/20 text-sm hover:border-primary/50 hover:bg-primary/10"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr_180px] gap-4">
          <label className="space-y-1.5">
            <span className={labelCls}>Button text</span>
            <input
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              maxLength={64}
              className={inputCls}
            />
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Button URL</span>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                maxLength={512}
                className={`${inputCls} pl-9`}
              />
            </div>
          </label>
          <label className="space-y-1.5">
            <span className={labelCls}>Button mode</span>
            <select
              value={buttonMode}
              onChange={(e) => setButtonMode(e.target.value as ButtonMode)}
              className={inputCls}
            >
              <option value="web_app">Mini App (TMA)</option>
              <option value="url">External link</option>
            </select>
          </label>
        </div>

        <div className="grid lg:grid-cols-[1fr_220px] gap-4 items-end">
          <div className="grid sm:grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users size={14} />
                Audience
              </div>
              <div className="mt-1 text-base font-semibold text-foreground">{selectedCount}</div>
              <div className="text-[11px] text-muted-foreground">{AUDIENCE_LABELS[audience]}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Length</div>
              <div className={`mt-1 text-base font-semibold ${estimatedLength > MESSAGE_LIMIT ? "text-red-400" : "text-foreground"}`}>
                {estimatedLength}/{MESSAGE_LIMIT}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {usesFollowupMessage ? "photo + message" : "single message"}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className={`mt-1 text-sm font-semibold ${canSend ? "text-emerald-400" : "text-amber-400"}`}>
                {canSend ? "Ready" : "Draft"}
              </div>
              <div className="text-[11px] text-muted-foreground">confirm: SEND</div>
            </div>
          </div>

          <label className="space-y-1.5">
            <span className={labelCls}>Tasdiqlash</span>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SEND"
              className={inputCls}
            />
          </label>
        </div>

        {(hasButtonHalf || !urlIsSafe || !webAppUrlIsSafe || estimatedLength > MESSAGE_LIMIT || sendMutation.error) && (
          <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-300 flex gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <div>
              {hasButtonHalf && <p>Button text va URL ikkalasi ham to'ldirilishi kerak.</p>}
              {!urlIsSafe && <p>URL http://, https:// yoki tg:// bilan boshlanishi kerak.</p>}
              {!webAppUrlIsSafe && <p>Mini App tugmasi uchun URL https:// bilan boshlanishi kerak.</p>}
              {estimatedLength > MESSAGE_LIMIT && <p>Matn Telegram limiti uchun juda uzun.</p>}
              {sendMutation.error && (
                <p>{(sendMutation.error as any)?.response?.data?.detail || "Broadcast yuborilmadi."}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles size={14} className="text-primary" />
            <span>Rasm, link button, emoji va paragraphlar Telegram formatida ketadi.</span>
          </div>
          <button
            disabled={!canSend}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-primary/90"
          >
            <Send size={15} />
            {sendMutation.isPending ? "Yuborilmoqda..." : "Broadcast yuborish"}
          </button>
        </div>
      </form>

      <aside className="space-y-4">
        <div className={`${cardCls} overflow-hidden`}>
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Telegram preview</h3>
            <span className="text-[11px] text-muted-foreground">{AUDIENCE_LABELS[audience]}</span>
          </div>
          <div className="bg-[#0f1b28] p-4">
            <div className="max-w-[360px] rounded-lg rounded-bl-sm bg-[#1f2f3f] overflow-hidden shadow-lg">
              {previewUrl && <img src={previewUrl} alt="" className="w-full aspect-video object-cover bg-muted" />}
              <div className="p-4 space-y-3">
                <h3 className="text-base font-semibold text-white leading-snug">{title || "Sarlavha"}</h3>
                <div className="space-y-3">
                  {(paragraphs.length ? paragraphs : ["Xabar matni"]).map((p, i) => (
                    <p key={i} className="text-sm text-slate-100/90 leading-6 whitespace-pre-line break-words">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            {buttonText && buttonUrl && (
              <div className="mt-2 max-w-[360px] rounded-lg bg-[#1f2f3f] px-3 py-2.5 text-center text-sm font-semibold text-white">
                {buttonText}
                <div className="text-[10px] font-normal text-slate-300">
                  {buttonMode === "web_app" ? "opens Mini App" : "opens link"}
                </div>
              </div>
            )}
            {usesFollowupMessage && (
              <div className="mt-3 max-w-[360px] rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
                Rasm caption limiti oshgani uchun matn alohida xabar bo'lib ketadi.
              </div>
            )}
          </div>
        </div>
        {result && <ResultBox result={result} />}
      </aside>
    </div>
  );
}
