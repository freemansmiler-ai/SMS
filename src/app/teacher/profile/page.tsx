"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchCurrentTeacherFullProfile,
  updateTeacherProfileInfo,
  uploadTeacherPhoto,
  updateTeacherPassword,
  TeacherFullProfile,
} from "@/lib/services/teacher-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserCheck,
  Mail,
  Phone,
  BookOpen,
  School,
  Calendar,
  Lock,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherFullProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [phone, setPhone] = useState<string>("");
  const [savingContact, setSavingContact] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);

  // Password state
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false);

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchCurrentTeacherFullProfile();
    setProfile(data);
    if (data) {
      setPhone(data.phone || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    setMsg(null);

    const res = await updateTeacherProfileInfo({ phone });
    setSavingContact(false);

    if (!res.success) {
      setMsg({ type: "error", text: res.error || "Failed to update phone number." });
      return;
    }

    setMsg({ type: "success", text: "Contact information updated successfully." });
    loadData();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setMsg(null);

    const res = await uploadTeacherPhoto(file);
    setUploadingPhoto(false);

    if (!res.success) {
      setMsg({ type: "error", text: res.error || "Failed to upload photo." });
      return;
    }

    setMsg({ type: "success", text: "Profile photo updated successfully." });
    loadData();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setMsg({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }

    setUpdatingPassword(true);
    const res = await updateTeacherPassword(newPassword);
    setUpdatingPassword(false);

    if (!res.success) {
      setMsg({ type: "error", text: res.error || "Failed to update password." });
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMsg({ type: "success", text: "Password updated successfully." });
  };

  if (loading) {
    return (
      <DashboardShell role="teacher">
        <div className="space-y-5">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!profile) {
    return (
      <DashboardShell role="teacher">
        <div className="py-12 text-center text-xs text-slate-500">
          Teacher profile record not found.
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="teacher"
      breadcrumbs={[{ label: "Teacher Dashboard", href: "/teacher" }, { label: "My Profile" }]}
    >
      <div className="space-y-5">
        {/* Profile Card Header */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-2 border-slate-200 dark:border-slate-700">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="text-2xl font-bold bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
                      {profile.firstName[0]}
                      {profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="photoUploadInput"
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white cursor-pointer hover:bg-slate-800 shadow-xs"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <input
                      id="photoUploadInput"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <Badge variant="success" className="capitalize text-[10px]">
                      {profile.isActive ? "Active Account" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Employee ID: {profile.employeeCode}
                    </span>
                    <span>•</span>
                    <span>{profile.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified Faculty Member</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <UserCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Joined Faculty
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {profile.joiningDate}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Message */}
        {msg && (
          <Alert variant={msg.type === "error" ? "destructive" : "default"} className="py-2.5">
            {msg.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            <AlertDescription className="text-xs font-semibold">{msg.text}</AlertDescription>
          </Alert>
        )}

        {/* Concise Assignment Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Subjects</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {profile.subjectCount}
                </p>
              </div>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Classes</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">
                  {profile.classCount}
                </p>
              </div>
              <School className="h-5 w-5 text-purple-600" />
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Current Academic Year</p>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-50 truncate mt-1">
                  {profile.currentAcademicYear}
                </p>
              </div>
              <Calendar className="h-5 w-5 text-emerald-600" />
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Current Term</p>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-50 mt-1">
                  {profile.currentTerm}
                </p>
              </div>
              <Badge variant="success" className="text-[10px]">
                Active
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Info Forms */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Permitted Contact Details Form */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>Personal & Official Contact Details</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Teachers can update their phone contact information for official school communication.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Official Email (Read-Only)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input disabled value={profile.email} className="h-8 text-xs bg-slate-100 dark:bg-slate-800 font-mono" />
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number (Editable)
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 123 4567"
                    className="h-8 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Department (Read-Only)
                    </label>
                    <Input disabled value={profile.department} className="h-8 text-xs bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Qualification (Read-Only)
                    </label>
                    <Input disabled value={profile.qualification} className="h-8 text-xs bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={savingContact} className="gap-1.5 font-semibold text-xs">
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingContact ? "Saving..." : "Save Contact Details"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Security Form & Administrative Restrictions */}
          <div className="space-y-5">
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>Account Security & Password Management</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Update your authentication password securely. Minimum 8 characters required.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      New Password *
                    </label>
                    <Input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Confirm New Password *
                    </label>
                    <Input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" size="sm" disabled={updatingPassword} className="gap-1.5 font-semibold text-xs">
                      <Lock className="h-3.5 w-3.5" />
                      <span>{updatingPassword ? "Updating..." : "Update Password"}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <CardContent className="p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Controlled Administrative Records Notice
                  </p>
                  <p className="leading-relaxed text-[11px]">
                    User role, school association, department assignments, and account activation status are strictly managed by the School Administrator. Contact administration for structural changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
