import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "숫자야구 2026",
  description: "중복 없는 3자리 숫자를 추리하는 숫자야구 게임",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border-line bg-surface/70 backdrop-blur sticky top-0 z-40">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span aria-hidden>⚾</span>
              <span className="tracking-tight">숫자야구 2026</span>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link
                href="/play"
                className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-raised hover:text-foreground"
              >
                플레이
              </Link>
              <Link
                href="/ranking"
                className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-raised hover:text-foreground"
              >
                랭킹
              </Link>
              <Link
                href="/instruction"
                className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-raised hover:text-foreground"
              >
                규칙
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border-line py-6 text-center text-xs text-muted">
          숫자야구 2026 — 3자리 숫자를 추리해보세요
        </footer>
      </body>
    </html>
  );
}
