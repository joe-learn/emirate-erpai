import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ToastProvider } from "@/components/ui/toast";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصّة الموارد البشرية الذكية | إمارة",
  description:
    "منصّة داخلية لموظفي الإمارة — تقديم طلبات الموارد البشرية عبر مساعد ذكي، ولوحة إدارة وتحليلات.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1F5C33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
