import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { WorkspaceProvider } from "@/lib/workspace/WorkspaceContext";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dealock - Commercial Real Estate Operating System",
  description: "AI-powered seller mandate operating system for elite real estate agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <WorkspaceProvider>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-auto p-8">
                  {children}
                </main>
              </div>
            </div>
          </WorkspaceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
