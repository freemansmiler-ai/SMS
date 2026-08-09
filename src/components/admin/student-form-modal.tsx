"use client";

import React, { useState, useEffect } from "react";
import { CreateStudentPayload, StudentRecord, uploadStudentPhoto } from "@/lib/services/students";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, AlertCircle, Plus, Save, Key, Check, Copy } from "lucide-react";

interface StudentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: StudentRecord | null;
  onSubmit: (payload: CreateStudentPayload) => Promise<{ success: boolean; temporaryPassword?: string; error?: string }>;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  open,
  onOpenChange,
  student,
  onSubmit,
}) => {
  const isEditing = Boolean(student);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Temporary credentials view state
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (student) {
      setFirstName(student.firstName);
      setLastName(student.lastName);
      setEmail(student.email);
      setStudentCode(student.studentCode);
      setDateOfBirth(student.dateOfBirth || "");
      setGender(student.gender || "Male");
      setGuardianName(student.guardianName || "");
      setGuardianContact(student.guardianContact || "");
      setAvatarUrl(student.avatarUrl || "");
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setStudentCode(`STU-2026-${Math.floor(100 + Math.random() * 900)}`);
      setDateOfBirth("2008-01-01");
      setGender("Male");
      setGuardianName("");
      setGuardianContact("");
      setAvatarUrl("");
    }
    setErrorMsg(null);
    setCreatedTempPassword(null);
    setCopied(false);
  }, [student, open]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadedUrl = await uploadStudentPhoto(file);
    if (uploadedUrl) {
      setAvatarUrl(uploadedUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validation
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("First name and last name are required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("A valid email address is required.");
      return;
    }
    if (!studentCode.trim()) {
      setErrorMsg("Student registration code is required.");
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      firstName,
      lastName,
      email,
      studentCode,
      dateOfBirth,
      gender,
      guardianName,
      guardianContact,
      avatarUrl,
    });

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Failed to save student record.");
      return;
    }

    if (!isEditing && result.temporaryPassword) {
      setCreatedTempPassword(result.temporaryPassword);
    } else {
      onOpenChange(false);
    }
  };

  const copyCredentials = () => {
    if (!createdTempPassword) return;
    const text = `Student Portal Credentials\nEmail: ${email}\nTemporary Password: ${createdTempPassword}\nNote: Password change will be required upon first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {createdTempPassword
              ? "Account Created Successfully"
              : isEditing
              ? "Edit Student Record"
              : "Register New Student"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {createdTempPassword
              ? "Temporary login credentials generated. Provide these securely to the student."
              : "Manage student profile, academic class assignment, and guardian contact info."}
          </DialogDescription>
        </DialogHeader>

        {createdTempPassword ? (
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <Key className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Temporary Student Login Credentials</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Username/Email:</span>
                  <span className="font-semibold">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Temp Password:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{createdTempPassword}</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                The student will be forced to change this temporary password upon first login. Permanent passwords are never stored in database tables or logs.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyCredentials}
                className="gap-1.5 text-xs font-semibold"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied to Clipboard" : "Copy Credentials"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="font-semibold"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            {errorMsg && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 py-1">
              {/* Photo Upload Section */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <Avatar className="h-14 w-14 border border-slate-200 dark:border-slate-700">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-slate-200 text-slate-700 font-bold text-base dark:bg-slate-700 dark:text-slate-200">
                    {firstName ? firstName[0] : <User className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Student Profile Photo
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                      <Upload className="h-3 w-3 text-slate-500" />
                      <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                      />
                    </label>
                    {avatarUrl && (
                      <span className="text-[10px] text-emerald-600 font-medium">Photo attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Names & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    First Name *
                  </label>
                  <Input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g., Lucas"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Last Name *
                  </label>
                  <Input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g., Miller"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Student Code *
                  </label>
                  <Input
                    required
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="STU-2026-001"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@academy.edu"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Birth Date & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Permitted Guardian Contact Information */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Permitted Contact Information
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Guardian Full Name
                    </label>
                    <Input
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Parent or Legal Guardian"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Guardian Contact Number
                    </label>
                    <Input
                      value={guardianContact}
                      onChange={(e) => setGuardianContact(e.target.value)}
                      placeholder="+233 24 000 0000"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading || uploading} className="gap-1.5 font-semibold">
                  {isEditing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>{loading ? "Saving..." : isEditing ? "Update Student" : "Register Student"}</span>
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
