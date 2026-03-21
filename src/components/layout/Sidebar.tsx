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
    <aside className="w-64 bg-[#0d0d0f] border-r border-white/[0.06] flex flex-col">
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
      <nav className="flex-1 px-4 py-6 space-y-0.5">
        {navKeys.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {t.nav[item.key]}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-sm font-medium border border-white/10">
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
