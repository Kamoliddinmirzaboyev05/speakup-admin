import { useState } from "react";
import { Save, CheckCircle, AlertTriangle, Bot, Bell, Clock, Globe, Shield } from "lucide-react";

interface AppSettings {
  appName: string;
  botUsername: string;
  miniAppUrl: string;
  freeMinutesOnRegister: number;
  dailyFreeLimit: number;
  dailyPremiumLimit: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  notificationsEnabled: boolean;
  streakReminderHour: number;
  weeklyReportEnabled: boolean;
  maxSessionDuration: number;
  allowAiPartner: boolean;
  allowHumanPartner: boolean;
  minSessionDuration: number;
}

const DEFAULT: AppSettings = {
  appName: "Sayra AI - Speaking Tutor",
  botUsername: "SayraAIBot",
  miniAppUrl: "https://t.me/SayraAIBot/app",
  freeMinutesOnRegister: 30,
  dailyFreeLimit: 10,
  dailyPremiumLimit: 120,
  maintenanceMode: false,
  maintenanceMessage: "We are performing maintenance. Please check back in 30 minutes.",
  notificationsEnabled: true,
  streakReminderHour: 19,
  weeklyReportEnabled: true,
  maxSessionDuration: 45,
  allowAiPartner: true,
  allowHumanPartner: true,
  minSessionDuration: 3,
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${value ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange, min = 0, max = 9999, unit }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="number" value={value} min={min} max={max}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-20 bg-muted border border-border rounded-lg px-2 py-1.5 text-xs font-mono text-foreground text-right focus:outline-none focus:ring-1 focus:ring-primary/40" />
      {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    {
      title: "General",
      icon: Globe,
      content: (
        <>
          <SettingRow label="App Name">
            <input value={settings.appName} onChange={(e) => set("appName", e.target.value)}
              className="w-56 bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
          </SettingRow>
          <SettingRow label="Bot Username">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">@</span>
              <input value={settings.botUsername} onChange={(e) => set("botUsername", e.target.value)}
                className="w-48 bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/40" />
            </div>
          </SettingRow>
          <SettingRow label="Mini App URL" hint="Telegram Mini App deep link">
            <input value={settings.miniAppUrl} onChange={(e) => set("miniAppUrl", e.target.value)}
              className="w-64 bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/40" />
          </SettingRow>
        </>
      ),
    },
    {
      title: "Limits & Minutes",
      icon: Clock,
      content: (
        <>
          <SettingRow label="Free minutes on registration" hint="Bonus minutes given to new users">
            <NumberInput value={settings.freeMinutesOnRegister} onChange={(v) => set("freeMinutesOnRegister", v)} min={0} max={999} unit="min" />
          </SettingRow>
          <SettingRow label="Free plan daily limit" hint="Max minutes per day for free users">
            <NumberInput value={settings.dailyFreeLimit} onChange={(v) => set("dailyFreeLimit", v)} min={1} max={999} unit="min" />
          </SettingRow>
          <SettingRow label="Premium plan daily limit" hint="Max minutes per day for premium users">
            <NumberInput value={settings.dailyPremiumLimit} onChange={(v) => set("dailyPremiumLimit", v)} min={1} max={999} unit="min" />
          </SettingRow>
          <SettingRow label="Min session duration" hint="Minimum minutes to count a session">
            <NumberInput value={settings.minSessionDuration} onChange={(v) => set("minSessionDuration", v)} min={1} max={30} unit="min" />
          </SettingRow>
          <SettingRow label="Max session duration" hint="Maximum allowed session length">
            <NumberInput value={settings.maxSessionDuration} onChange={(v) => set("maxSessionDuration", v)} min={5} max={180} unit="min" />
          </SettingRow>
        </>
      ),
    },
    {
      title: "Partners",
      icon: Bot,
      content: (
        <>
          <SettingRow label="Allow AI partner" hint="Users can practice with AI">
            <Toggle value={settings.allowAiPartner} onChange={(v) => set("allowAiPartner", v)} />
          </SettingRow>
          <SettingRow label="Allow Human partner" hint="Users can be matched with other users">
            <Toggle value={settings.allowHumanPartner} onChange={(v) => set("allowHumanPartner", v)} />
          </SettingRow>
        </>
      ),
    },
    {
      title: "Notifications",
      icon: Bell,
      content: (
        <>
          <SettingRow label="Push notifications" hint="Enable Telegram bot notifications">
            <Toggle value={settings.notificationsEnabled} onChange={(v) => set("notificationsEnabled", v)} />
          </SettingRow>
          <SettingRow label="Streak reminder hour" hint="Hour (UTC) to send daily streak reminders">
            <NumberInput value={settings.streakReminderHour} onChange={(v) => set("streakReminderHour", Math.min(23, Math.max(0, v)))} min={0} max={23} unit=":00 UTC" />
          </SettingRow>
          <SettingRow label="Weekly progress reports" hint="Send weekly summary to users">
            <Toggle value={settings.weeklyReportEnabled} onChange={(v) => set("weeklyReportEnabled", v)} />
          </SettingRow>
        </>
      ),
    },
    {
      title: "Maintenance",
      icon: Shield,
      content: (
        <>
          <SettingRow label="Maintenance Mode" hint="Disable app access for all users">
            <Toggle value={settings.maintenanceMode} onChange={(v) => set("maintenanceMode", v)} />
          </SettingRow>
          {settings.maintenanceMode && (
            <div className="py-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs mb-2">
                <AlertTriangle size={13} /> App is currently in maintenance mode
              </div>
              <label className="text-xs text-muted-foreground block mb-1.5">Maintenance message shown to users</label>
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) => set("maintenanceMessage", e.target.value)}
                rows={3}
                className="w-full bg-muted border border-amber-400/30 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-400/40 resize-none"
              />
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {sections.map(({ title, icon: Icon, content }) => (
        <div key={title} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
            <Icon size={15} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{title}</span>
          </div>
          <div className="px-5">{content}</div>
        </div>
      ))}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">
          <Save size={15} /> Save Settings
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle size={15} /> Settings saved!
          </div>
        )}
      </div>
    </div>
  );
}
