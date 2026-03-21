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
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Command Center", href: "/", icon: LayoutDashboard },
  { name: "Sellers", href: "/sellers", icon: UserCircle },
  { name: "Buyers", href: "/buyers", icon: Users },
  { name: "Match", href: "/match", icon: Puzzle },
  { name: "Mandates", href: "/mandates", icon: FileSignature },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Activities", href: "/activities", icon: CheckSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d0d0f] border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight">Dealock</span>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Commercial OS</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.name}
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
