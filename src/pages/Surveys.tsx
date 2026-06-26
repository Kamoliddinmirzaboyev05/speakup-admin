import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import {
  surveysService,
  type AdminSurvey,
  type SurveyAudience,
} from "@/services/surveys";
import type { AdminUser } from "@/types";

const cardCls = "bg-card border border-border rounded-lg";
const inputCls =
  "w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/70 disabled:opacity-60";
const labelCls = "text-xs font-medium text-muted-foreground";

const AUDIENCE_LABELS: Record<SurveyAudience, string> = {
  onboarded: "Onboardingdan o'tganlar",
  not_onboarded: "Onboardingdan o'tmaganlar",
  all: "Barcha foydalanuvchilar",
  selected: "Tanlangan foydalanuvchilar",
};

const DEFAULT_QUESTION = "Nega onboardingdan o'tmadingiz?";
const DEFAULT_OPTIONS = [
  "Telefon raqam so'ralgani uchun",
  "Vaqtim bo'lmadi",
  "Tushunmadim",
  "Shunchaki tanishim aytgani uchun start bosdim",
];

function displayName(user: AdminUser) {
  return user.first_name || (user.username ? `@${user.username}` : `#${user.id}`);
}

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "good" | "bad" }) {
  const color = tone === "good" ? "text-emerald-400" : tone === "bad" ? "text-red-400" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function PollPreview({
  question,
  options,
  audience,
}: {
  question: string;
  options: string[];
  audience: SurveyAudience;
}) {
  return (
    <div className="rounded-lg border border-primary/30 bg-background/70 overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-primary/10">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Native Telegram poll
          </span>
          <span className="text-[11px] text-muted-foreground">single choice</span>
        </div>
        <div className="mt-2 text-sm font-semibold text-foreground leading-snug">
          {question.trim() || DEFAULT_QUESTION}
        </div>
      </div>
      <div className="p-3 space-y-2">
        {options.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            Javob variantlarini yozing.
          </div>
        )}
        {options.map((option, index) => (
          <div
            key={`${option}-${index}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/70 text-[10px] font-bold text-primary">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {option}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
        <span>{AUDIENCE_LABELS[audience]}</span>
        <span>{options.length}/6 options</span>
      </div>
    </div>
  );
}

function SurveyResults({ survey }: { survey: AdminSurvey }) {
  const topCount = Math.max(1, ...survey.options.map((option) => option.count));
  return (
    <div className={`${cardCls} overflow-hidden`}>
      <div className="border-b border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Poll natijalari</h3>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">
            Telegram poll
          </span>
        </div>
        <div className="mt-2 text-sm font-semibold text-foreground">{survey.question}</div>
      </div>
      <div className="space-y-3 p-4">
        {survey.options.map((option) => (
          <div key={option.id} className="rounded-lg border border-border bg-background/40 p-3">
            <div className="flex items-start justify-between gap-3 text-xs">
              <span className="font-medium text-foreground">{option.text}</span>
              <span className="shrink-0 font-mono text-muted-foreground">
                {option.count} · {option.percent}%
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, Math.min((option.count / topCount) * 100, 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResponsesTable({ survey }: { survey: AdminSurvey }) {
  const [optionId, setOptionId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const responses = useQuery({
    queryKey: ["surveys", survey.id, "responses", optionId, search],
    queryFn: () =>
      surveysService.responses(survey.id, {
        option_id: optionId === "" ? undefined : optionId,
        search: search || undefined,
        limit: 200,
        offset: 0,
      }),
  });

  return (
    <div className={cardCls}>
      <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Kim qanday javob berdi</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={optionId}
            onChange={(e) => setOptionId(e.target.value ? Number(e.target.value) : "")}
            className={`${inputCls} sm:w-56`}
          >
            <option value="">Barcha javoblar</option>
            {survey.options.map((option) => (
              <option key={option.id} value={option.id}>{option.text}</option>
            ))}
          </select>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, username, Telegram ID"
              className={`${inputCls} pl-9 sm:w-64`}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["User", "Telegram ID", "Status", "Answer", "Answered"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(responses.data?.items ?? []).map((row) => (
              <tr key={row.id} className="border-b border-border/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{row.first_name || row.username || `#${row.user_id}`}</div>
                  {row.username && <div className="text-muted-foreground">@{row.username}</div>}
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{row.telegram_id}</td>
                <td className="px-4 py-3">
                  <span className={row.onboarded ? "text-emerald-400" : "text-amber-400"}>
                    {row.onboarded ? "onboarded" : "not onboarded"}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">{row.option_text}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(row.answered_at).toLocaleString()}</td>
              </tr>
            ))}
            {!responses.isLoading && (responses.data?.items ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Javoblar yo'q</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Surveys() {
  const qc = useQueryClient();
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [audience, setAudience] = useState<SurveyAudience>("not_onboarded");
  const [confirmText, setConfirmText] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(true);

  const surveys = useQuery({
    queryKey: ["surveys"],
    queryFn: surveysService.list,
    staleTime: 10_000,
  });
  const selectedSurvey = useQuery({
    queryKey: ["surveys", selectedSurveyId],
    queryFn: () => surveysService.get(selectedSurveyId as number),
    enabled: selectedSurveyId != null,
  });
  const usersQuery = useQuery({
    queryKey: ["surveys", "user-search", userSearch],
    queryFn: () => adminService.getUsers({ search: userSearch || undefined, limit: 8, offset: 0 }),
    enabled: audience === "selected",
    staleTime: 10_000,
  });

  const normalizedOptions = useMemo(
    () => options.map((option) => option.trim()).filter(Boolean),
    [options]
  );
  const canSend =
    question.trim().length > 0 &&
    normalizedOptions.length >= 2 &&
    normalizedOptions.length <= 6 &&
    (audience !== "selected" || selectedUsers.length > 0) &&
    confirmText.trim().toUpperCase() === "SEND";

  const createMutation = useMutation({
    mutationFn: () =>
      surveysService.create({
        question,
        options: normalizedOptions,
        audience,
        selected_user_ids: audience === "selected" ? selectedUsers.map((user) => user.id) : undefined,
      }),
    onSuccess: (survey) => {
      setConfirmText("");
      setSelectedSurveyId(survey.id);
      qc.invalidateQueries({ queryKey: ["surveys"] });
    },
  });

  const addOption = () => {
    if (options.length < 6) setOptions((current) => [...current, ""]);
  };
  const updateOption = (index: number, value: string) => {
    setOptions((current) => current.map((item, i) => i === index ? value : item));
  };
  const removeOption = (index: number) => {
    setOptions((current) => current.filter((_, i) => i !== index));
  };
  const addSelectedUser = (user: AdminUser) => {
    setSelectedUsers((current) => current.some((item) => item.id === user.id) ? current : [...current, user]);
  };

  const detail = selectedSurvey.data ?? surveys.data?.[0] ?? null;
  const isRefreshing = surveys.isFetching || selectedSurvey.isFetching;
  const refreshSurveyData = () => {
    qc.invalidateQueries({ queryKey: ["surveys"] });
    if (detail) {
      qc.invalidateQueries({ queryKey: ["surveys", detail.id] });
      qc.invalidateQueries({ queryKey: ["surveys", detail.id, "responses"] });
    }
  };

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_520px] gap-5">
      <form
        className={`${cardCls} overflow-hidden`}
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) createMutation.mutate();
        }}
      >
        <button
          type="button"
          onClick={() => setIsComposerOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 border-b border-border bg-muted/20 p-4 text-left hover:bg-muted/30"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Send size={18} className="shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-base font-semibold text-foreground">So'rovnoma yuborish</span>
              <span className="block truncate text-xs text-muted-foreground">
                Native Telegram poll · {AUDIENCE_LABELS[audience]} · {normalizedOptions.length}/6 options
              </span>
            </span>
          </span>
          {isComposerOpen ? (
            <ChevronUp size={18} className="shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
          )}
        </button>

        {isComposerOpen && (
          <div className="space-y-5 p-5">

        <label className="space-y-1.5 block">
          <span className={labelCls}>Savol</span>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            maxLength={512}
            className={`${inputCls} resize-none`}
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={labelCls}>Javob variantlari</span>
            <button
              type="button"
              onClick={addOption}
              disabled={options.length >= 6}
              className="inline-flex items-center gap-1.5 text-xs text-primary disabled:opacity-40"
            >
              <Plus size={13} /> Add option
            </button>
          </div>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                maxLength={256}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                className="px-3 rounded-lg border border-border text-muted-foreground hover:text-red-400 disabled:opacity-30"
                aria-label="Remove option"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {(["not_onboarded", "onboarded", "selected", "all"] as SurveyAudience[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setAudience(key)}
              className={`rounded-lg border px-3 py-2 text-left ${
                audience === key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="text-xs font-semibold">{key === "not_onboarded" ? "not onboarded" : key}</div>
              <div className="text-[10px] leading-tight mt-0.5">{AUDIENCE_LABELS[key]}</div>
            </button>
          ))}
        </div>

        {audience === "selected" && (
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <label className="space-y-1.5 block">
              <span className={labelCls}>User qidirish</span>
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Ism, username yoki Telegram ID"
                className={inputCls}
              />
            </label>
            <div className="grid lg:grid-cols-2 gap-3">
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {(usersQuery.data?.items ?? []).map((user) => {
                  const selected = selectedUsers.some((item) => item.id === user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      disabled={selected}
                      onClick={() => addSelectedUser(user)}
                      className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-left disabled:opacity-45 hover:border-primary/50"
                    >
                      <span className="block text-sm text-foreground truncate">{displayName(user)}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">ID: {user.telegram_id}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-1.5">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5">
                    <span className="text-xs text-foreground truncate">{displayName(user)}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedUsers((current) => current.filter((item) => item.id !== user.id))}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <PollPreview
            question={question}
            options={normalizedOptions}
            audience={audience}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users size={14} />
            Userlar poll ichida javobini tanlagandan keyin belgilangan holatda ko'radi.
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Yuborishni tasdiqlash</span>
              <span>{AUDIENCE_LABELS[audience]}</span>
            </div>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type "SEND" to confirm'
              className={inputCls}
            />
          </div>
        </div>

        {createMutation.error && (
          <p className="text-xs text-red-400">
            {(createMutation.error as any)?.response?.data?.detail ?? "Could not send survey"}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSend || createMutation.isPending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Send size={16} />
          {createMutation.isPending ? "Sending..." : "Send survey"}
        </button>
          </div>
        )}
      </form>

      <div className="space-y-5">
        <div className={cardCls}>
          <div className="p-4 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">So'rovnomalar</h3>
            </div>
            <button
              type="button"
              onClick={refreshSurveyData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/20 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {(surveys.data ?? []).map((survey) => (
              <button
                key={survey.id}
                type="button"
                onClick={() => setSelectedSurveyId(survey.id)}
                className={`w-full text-left p-4 hover:bg-muted/20 ${
                  detail?.id === survey.id ? "bg-primary/10" : ""
                }`}
              >
                <div className="text-sm font-medium text-foreground line-clamp-2">{survey.question}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {AUDIENCE_LABELS[survey.audience]} · {survey.responses}/{survey.eligible} responses
                </div>
              </button>
            ))}
            {!surveys.isLoading && (surveys.data ?? []).length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">Hali survey yo'q.</div>
            )}
          </div>
        </div>

        {detail && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="eligible" value={detail.eligible} />
              <Stat label="sent" value={detail.sent} tone="good" />
              <Stat label="failed" value={detail.failed} tone={detail.failed ? "bad" : "default"} />
              <Stat label="response rate" value={`${detail.response_rate}%`} />
            </div>
            <SurveyResults survey={detail} />
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 size={14} />
              {detail.status} · Native Telegram poll
            </div>
            <button
              type="button"
              onClick={refreshSurveyData}
              disabled={isRefreshing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground hover:bg-muted/30 disabled:opacity-50"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
              Natijalarni yangilash
            </button>
            <ResponsesTable survey={detail} />
          </>
        )}
      </div>
    </div>
  );
}
