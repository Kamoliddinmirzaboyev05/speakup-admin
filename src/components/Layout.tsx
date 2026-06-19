import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Users, Trophy, Mic, LogOut, ChevronLeft, ChevronRight,
  Menu, X, Bot, ShieldCheck, BookOpen, CreditCard, Crown, Settings,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Boshqaruv" },
  { to: "/users", icon: Users, label: "Foydalanuvchilar" },
  { to: "/leaderboard", icon: Trophy, label: "Reyting" },
  { to: "/sessions", icon: Mic, label: "Sessiyalar" },
  { to: "/questions", icon: BookOpen, label: "Savollar" },
  { to: "/payments", icon: CreditCard, label: "To'lovlar" },
  { to: "/plans", icon: Crown, label: "Tariflar" },
  { to: "/settings", icon: Settings, label: "Sozlamalar" },
  { to: "/admins", icon: ShieldCheck, label: "Adminlar" },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Boshqaruv paneli",
  "/users": "Foydalanuvchilar",
  "/leaderboard": "Reyting",
  "/sessions": "Sessiyalar",
  "/questions": "Savollar (IELTS)",
  "/payments": "To'lovlar va sharhlar",
  "/plans": "Tariflar",
  "/settings": "Sozlamalar",
  "/admins": "Adminlar",
};

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center ring-1 ring-primary/30`}>
      {initials}
    </div>
  );
}

export default function Layout() {
  const { admin, logout, sidebarCollapsed, toggleSidebar } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
  )?.[1] ?? "Admin";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-sidebar-border ${sidebarCollapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Bot size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <div className="text-sm font-semibold text-sidebar-foreground leading-none">SpeakUp</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Admin panel</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
              ${sidebarCollapsed ? "justify-center" : ""}
              ${isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"}`} />
                {!sidebarCollapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Collapse */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {!sidebarCollapsed && admin && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/50">
            <Avatar name={admin.name} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-sidebar-foreground truncate">{admin.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{admin.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ${sidebarCollapsed ? "justify-center" : ""}`}
        >
          <LogOut size={16} />
          {!sidebarCollapsed && <span>Chiqish</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-200 ${sidebarCollapsed ? "w-16" : "w-56"}`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full ml-0 z-10 hidden md:flex w-5 h-10 items-center justify-center bg-sidebar border border-sidebar-border rounded-r-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
          style={{ left: sidebarCollapsed ? "4rem" : "14rem" }}
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-sidebar border-r border-sidebar-border flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center gap-4 px-4 md:px-6 shrink-0 bg-card/50 backdrop-blur-sm">
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
          <div className="flex-1" />
          {admin && <Avatar name={admin.name} />}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
