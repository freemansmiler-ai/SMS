"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { School, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const result = await resetPassword(email);

    if (!result.success) {
      setErrorMsg(result.error || "Failed to send reset link.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-50 shadow-md dark:bg-slate-100 dark:text-slate-900">
            <School className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your email address to receive password recovery instructions.
          </p>
        </div>

        <Card className="border-slate-200/80 shadow-xs dark:border-slate-800">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-base font-semibold">Password Recovery</CardTitle>
            <CardDescription className="text-xs">
              Supabase Auth will issue a secure one-time reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {errorMsg && (
              <Alert variant="destructive" className="py-2.5">
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}

            {submitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-emerald-600 dark:bg-slate-800 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Reset Email Sent
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We sent instructions to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
                </p>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="mt-2 text-xs">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Account Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@academy.edu"
                    className="h-9 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 text-xs gap-1.5 font-semibold mt-2"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>{loading ? "Sending link..." : "Send Password Reset Email"}</span>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
