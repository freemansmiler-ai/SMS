"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchStudentProfile,
  updateStudentContactInfo,
  uploadStudentAvatar,
  changeStudentPassword,
  StudentProfileData,
} from "@/lib/services/student-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  ShieldCheck,
  School,
  Lock,
  Phone,
  Mail,
  MapPin,
  Camera,
  Edit,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

function EditContactModal({
  profile,
  open,
  onOpenChange,
  onUpdated,
}: {
  profile: StudentProfileData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await updateStudentContactInfo({ phone, address });
    setSaving(false);

    if (!res.success) {
      setError(res.error || "Failed to update contact info.");
      return;
    }

    onUpdated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Edit className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>Edit Contact Information</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update your permitted contact details. Name, ID, and class assignments are read-only.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2 text-xs">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 24 000 0000"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Residential Address</label>
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Achimota, Accra"
              className="h-8 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="h-8 text-xs font-semibold">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSaving(true);
    const res = await changeStudentPassword(newPassword);
    setSaving(false);

    if (!res.success) {
      setError(res.error || "Failed to update password.");
      return;
    }

    setSuccessMsg("Password changed successfully.");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setSuccessMsg(null);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>Change Account Password</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update your account password using Supabase secure authentication.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription>{successMsg}</AlertDescription>
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
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="h-8 text-xs font-semibold">
              {saving ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [openContactModal, setOpenContactModal] = useState<boolean>(false);
  const [openPasswordModal, setOpenPasswordModal] = useState<boolean>(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchStudentProfile();
      setProfile(data);
    } catch {
      // Fallback loaded
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setNotice(null);
    const res = await uploadStudentAvatar(file);
    setUploading(false);

    if (!res.success) {
      setNotice(`Upload Error: ${res.error}`);
      return;
    }

    setNotice("Profile photo updated successfully.");
    loadProfile();
  };

  if (loading) {
    return (
      <DashboardShell role="student" breadcrumbs={[{ label: "Student Portal Dashboard", href: "/student" }, { label: "My Profile" }]}>
        <div className="space-y-5">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="student" breadcrumbs={[{ label: "Student Portal Dashboard", href: "/student" }, { label: "My Profile" }]}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>My Student Profile & Account Security</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View permitted profile details, manage contact information, and update account password.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={loadProfile} className="h-8 text-xs gap-1 self-start sm:self-auto">
            <RefreshCw className="h-3 w-3" />
            Refresh Profile
          </Button>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Field-Level Security Enforced: Student ID, School ID, Class Assignment, and Academic Status are protected read-only fields.
            </span>
          </div>
        </div>

        {/* Notice Alert if photo uploaded */}
        {notice && (
          <Alert variant={notice.startsWith("Upload Error") ? "destructive" : "success"}>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card Header */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="h-16 w-16 rounded-full bg-slate-900 text-white font-black text-xl flex items-center justify-center border-2 border-slate-700 shrink-0 overflow-hidden">
                  {profile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    profile?.fullName.split(" ").map((n) => n[0]).join("")
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700 shadow-xs">
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{profile?.fullName}</h2>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {profile?.studentCode}
                  </Badge>
                  <Badge variant="success" className="text-[10px] uppercase">
                    {profile?.accountStatus}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {profile?.className} • {profile?.schoolName}
                </p>
                <p className="text-[10px] text-slate-400 italic">
                  Contact school administration to update your official full name.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button size="sm" variant="outline" onClick={() => setOpenContactModal(true)} className="h-8 text-xs gap-1.5 font-semibold">
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Contact Info</span>
              </Button>

              <Button size="sm" onClick={() => setOpenPasswordModal(true)} className="h-8 text-xs gap-1.5 font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900">
                <Lock className="h-3.5 w-3.5" />
                <span>Change Password</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout for Information Cards */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Read-Only Academic & Administrative Info */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <School className="h-4 w-4 text-slate-500" />
                <span>Protected Academic & School Information</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Administrative governance details controlled by the Administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">School Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profile?.schoolName}</span>
                </div>
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">School Code</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile?.schoolCode}</span>
                </div>
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Enrolled Class</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profile?.className}</span>
                </div>
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Academic Year</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile?.academicYearName}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permitted Personal & Contact Information */}
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Personal & Contact Information</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Your contact details and demographic information.
                </CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setOpenContactModal(true)} className="h-7 text-xs gap-1 font-semibold text-blue-600">
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-400">School Email:</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile?.email || "Not specified"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-400">Phone Number:</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile?.phone || "Not specified"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-400">Address:</span>
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.address || "Achimota, Accra"}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-md bg-slate-50 dark:bg-slate-800/40 border text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Gender</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profile?.gender}</span>
                </div>
                <div className="p-2 rounded-md bg-slate-50 dark:bg-slate-800/40 border text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Date of Birth</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile?.dateOfBirth}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <EditContactModal profile={profile} open={openContactModal} onOpenChange={setOpenContactModal} onUpdated={loadProfile} />
        <ChangePasswordModal open={openPasswordModal} onOpenChange={setOpenPasswordModal} />
      </div>
    </DashboardShell>
  );
}
