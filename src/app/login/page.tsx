"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/constants/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { School, LogIn, AlertCircle, Shield, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("administrator");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // 10-second safety timeout to prevent UI hanging indefinitely
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setErrorMsg("Authentication request timed out. Please check your network connection and try again.");
    }, 10000);

    try {
      const loginEmail = email.trim() || `${selectedRole}@academy.edu`;
      const result = await signIn(loginEmail, password, email.trim() ? undefined : selectedRole);
      clearTimeout(timeoutId);

      if (!result.success) {
        setErrorMsg(result.error || "Invalid login credentials. Please check your email and password.");
        setLoading(false);
        return;
      }

      // Role-based Redirects
      switch (result.role) {
        case "administrator":
          router.push("/admin");
          break;
        case "principal":
          router.push("/principal");
          break;
        case "teacher":
          router.push("/teacher");
          break;
        case "student":
          router.push("/student");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during authentication.";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-50 shadow-md dark:bg-slate-100 dark:text-slate-900">
            <School className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Apex Academy Platform
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enterprise School Management System Portal
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-semibold">Sign In to Your Account</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access role-specific dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {errorMsg && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}

            {/* Role Demo Quick Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Shield className="h-3 w-3 text-slate-400" />
                <span>Quick Role Selection (Preview Mode)</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["administrator", "principal", "teacher", "student"] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setSelectedRole(r);
                      setEmail(`${r}@academy.edu`);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs text-left transition-colors ${
                      selectedRole === r
                        ? "border-slate-900 bg-slate-900 text-slate-50 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 font-semibold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    <span>{ROLE_LABELS[r].badge}</span>
                    {selectedRole === r && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${selectedRole}@academy.edu`}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 text-xs gap-1.5 font-semibold mt-2"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{loading ? "Authenticating..." : `Sign In as ${ROLE_LABELS[selectedRole].badge}`}</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-slate-400">
          Protected by Supabase Auth & PostgreSQL Row Level Security (RLS).
        </p>
      </div>
    </div>
  );
}
