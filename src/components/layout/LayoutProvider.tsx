"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Routes qui n'affichent PAS la sidebar/header (pages auth, etc.)
const STANDALONE_ROUTES = ["/login", "/signup", "/auth"];

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Si on est sur une route standalone, on affiche juste le contenu
  const isStandalone = STANDALONE_ROUTES.some((route) => pathname?.startsWith(route));

  if (isStandalone) {
    return <>{children}</>;
  }

  // Sinon, on affiche le layout normal avec sidebar + header
  return (
    <div className="flex h-screen relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
