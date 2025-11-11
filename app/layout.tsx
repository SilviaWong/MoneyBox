import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "MoneyBox - 个人记账",
  description: "使用 Next.js + Prisma 构建的简洁个人记账应用"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
              <h1 className="text-2xl font-semibold tracking-tight">MoneyBox</h1>
              <ThemeToggle />
            </header>
            <main className="flex-1">{children}</main>
            <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-sm text-muted-foreground">
              用 ❤️ 记录你的每一笔收支
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
