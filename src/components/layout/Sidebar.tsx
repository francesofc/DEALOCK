"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Users,
  Puzzle,
  FileSignature,
  Wallet,
  CheckSquare,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const navKeys = [
  { key: "dashboard", href: "/", icon: LayoutDashboard },
  { key: "leads", href: "/sellers", icon: UserCircle },
  { key: "buyers", href: "/buyers", icon: Users },
  { key: "match", href: "/match", icon: Puzzle },
  { key: "mandates", href: "/mandates", icon: FileSignature },
  { key: "finance", href: "/finance", icon: Wallet },
  { key: "activities", href: "/activities", icon: CheckSquare },
  { key: "settings", href: "/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside
      className="w-64 flex flex-col relative"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderRight: "0.5px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/brand/dealock-symbol-white.svg"
            alt=""
            className="h-8 w-auto object-contain"
          />
          <div>
            <span className="font-semibold text-lg tracking-tight">Dealock</span>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Commercial OS</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navKeys.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-white"
                  : "text-white/55 hover:text-white hover:bg-white/[0.04]"
              )}
              style={isActive ? {
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "0.5px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 4px 16px rgba(109, 77, 255, 0.15)",
              } : undefined}
            >
              {/* Active gradient accent on the left */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: "linear-gradient(180deg, #6D4DFF 0%, #FF3D8B 100%)" }}
                />
              )}
              <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{t.nav[item.key]}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06]">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "0.5px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #6D4DFF 0%, #FF3D8B 100%)" }}
          >
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-white/40 truncate">john@dealock.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
