import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BookHeart, House, Settings, ChartColumn } from "lucide-react";

const tabs = [
  { to: "/", label: "Проекты", icon: House, match: /^\/(projects\/.*)?$/ },
  { to: "/library", label: "Узоры", icon: BookHeart, match: /^\/library/ },
  { to: "/stats", label: "Статистика", icon: ChartColumn, match: /^\/stats/ },
  { to: "/settings", label: "Настройки", icon: Settings, match: /^\/settings/ },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const hideNav = /\/projects\/[^/]+\/edit$/.test(location.pathname);

  return (
    <div className="min-h-screen flex flex-col app-bg pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-28">
        {children}
      </main>
      {!hideNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 backdrop-blur border-t border-terracotta-200/60 pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
          style={{
            zIndex: 40,
            backgroundImage: "linear-gradient(180deg, rgba(255,253,250,0.96) 0%, rgba(251,241,226,0.96) 100%)",
          }}
        >
          <div className="max-w-2xl mx-auto grid grid-cols-4">
            {tabs.map(({ to, label, icon: Icon, match }) => {
              const active = match.test(location.pathname);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 tap-target ${
                    active ? "text-terracotta-600" : "text-ink-500/60"
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2.1} strokeLinecap="round" strokeLinejoin="round" />
                  <span className="text-[11px] font-medium">{label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
