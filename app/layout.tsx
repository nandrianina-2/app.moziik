import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { PlayerProvider } from "@/context/PlayerProvider";
import { SiteConfigProvider } from "@/context/SiteConfigProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MiniPlayerBar } from "@/components/player/MiniPlayerBar";
import { FullPlayerPage } from "@/components/player/FullPlayerPage";
import { defaultSiteConfig } from "@/config/site";

const display = Sora({ subsets: ["latin"], variable: "--font-display" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: defaultSiteConfig.siteName,
  description: defaultSiteConfig.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <SiteConfigProvider>
          <AuthProvider>
            <ThemeProvider>
              <ToastProvider>
                <PlayerProvider>
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 pb-40 md:pb-24">{children}</main>
                  </div>
                  <MiniPlayerBar />
                  <FullPlayerPage />
                  <MobileNav />
                </PlayerProvider>
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
