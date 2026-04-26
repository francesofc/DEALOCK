import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutProvider } from "@/components/layout/LayoutProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { WorkspaceProvider } from "@/lib/workspace/WorkspaceContext";
import { AmbientBackground } from "@/components/layout/AmbientBackground";

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
        <AmbientBackground />
        <LanguageProvider>
          <WorkspaceProvider>
            <LayoutProvider>{children}</LayoutProvider>
          </WorkspaceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
