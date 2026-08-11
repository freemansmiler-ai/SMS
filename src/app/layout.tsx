import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codivex Academy | School Management System",
  description:
    "Codivex Technologies School Management System Foundation built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 antialiased dark:bg-slate-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
