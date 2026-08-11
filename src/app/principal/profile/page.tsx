"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/context/auth-context";
import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  School,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";

export default function PrincipalProfilePage() {
  const { profile, signOut } = useAuth();
  const [openPasswordModal, setOpenPasswordModal] = useState<boolean>(false);

  // Password Change state
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [changingPass, setChangingPass] = useState<boolean>(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("Password must be at least 6 characters long.");
      return;
    }

    setChangingPass(true);
    try {
      const config = getSupabaseEnvConfig();
      if (config.isConfigured && !config.isPlaceholder) {
        const supabase = createBrowserClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error(error.message);
      }
      setPassSuccess("Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPassSuccess(null);
        setOpenPasswordModal(false);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password update failed.";
      setPassError(msg);
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Principal Dashboard", href: "/principal" },
        { label: "Account Settings & Security" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Principal Account Settings & Security</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Academic leadership profile details, credential security, and session management.
            </p>
          </div>

          <Button variant="destructive" size="sm" onClick={() => signOut()} className="h-8 text-xs gap-1.5 self-start sm:self-auto font-semibold">
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              School Principal Account: Authorized for result approvals, school analytics, and official report publishing.
            </span>
          </div>
        </div>

        {/* Profile Card Header */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-900 text-white font-black text-xl flex items-center justify-center border-2 border-slate-700 shrink-0">
                {profile?.name ? profile.name.split(" ").map((n) => n[0]).join("") : "PRN"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{profile?.name || "School Principal"}</h2>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800">
                    Principal
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span>{profile?.email || "principal@academy.edu"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button size="sm" onClick={() => setOpenPasswordModal(true)} className="h-8 text-xs gap-1.5 font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900">
                <Lock className="h-3.5 w-3.5" />
                <span>Change Password</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Governance Details */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <School className="h-4 w-4 text-slate-500" />
                <span>Institution Jurisdiction</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Academic supervision and approval scope.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Institution Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Codivex Tech. School</span>
                <span className="font-mono text-slate-500 block text-[11px]">School Code: CodTech-2026</span>
              </div>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Authority Scope</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Terminal Result Approvals & Reporting</span>
                <span className="text-slate-500 block text-[11px]">School Reports, Performance Analytics & Faculty Workload Monitoring</span>
              </div>
            </CardContent>
          </Card>

          {/* Session & Security Card */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-500" />
                <span>Account Security Controls</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Manage your credentials and active session.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Account Password</span>
                  <span className="text-[11px] text-slate-500">Encrypted via Supabase Auth</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setOpenPasswordModal(true)} className="h-7 text-xs font-semibold">
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Session State</span>
                  <span className="text-[11px] text-emerald-600 font-medium">Active & Authorized</span>
                </div>
                <Button size="sm" variant="destructive" onClick={() => signOut()} className="h-7 text-xs font-semibold gap-1">
                  <LogOut className="h-3 w-3" />
                  <span>Log Out</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Change Password Modal */}
        <Dialog open={openPasswordModal} onOpenChange={setOpenPasswordModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span>Change Principal Password</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update your authentication password securely.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePasswordChange} className="space-y-4 py-2 text-xs">
              {passError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{passError}</AlertDescription>
                </Alert>
              )}

              {passSuccess && (
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <AlertDescription>{passSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="h-8 text-xs pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpenPasswordModal(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={changingPass} className="h-8 text-xs font-semibold">
                  {changingPass ? "Updating..." : "Change Password"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
