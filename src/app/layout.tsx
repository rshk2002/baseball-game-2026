import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 무료 숫자 추리 게임`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["숫자야구", "숫자야구 게임", "야구 게임", "숫자 추리 게임", "두뇌 게임", "무료 게임"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 무료 숫자 추리 게임`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — 무료 숫자 추리 게임`,
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: "0gIlX1W7cLYjfLHtndrXhTWwpyhKytmiHA3eAhhHMQY",
    other: {
      "naver-site-verification": "7fa8ff55b51557630993eb2c0681acebb1617f85",
    },
  },
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
