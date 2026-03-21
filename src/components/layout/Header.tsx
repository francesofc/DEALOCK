"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="h-20 border-b border-white/[0.06] bg-[#0d0d0f] flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search leads, mandates..."
            className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] rounded-xl text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/10 border border-white/[0.06] transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/[0.04]">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
        </Button>
      </div>
    </header>
  );
}
