"use client";

import React, { useState, useEffect } from "react";
import { CreateTeacherPayload, TeacherRecord } from "@/lib/services/teachers";
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
import { AlertCircle, Plus, Save } from "lucide-react";

interface TeacherFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: TeacherRecord | null;
  onSubmit: (payload: CreateTeacherPayload) => Promise<{ success: boolean; error?: string }>;
}

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  open,
  onOpenChange,
  teacher,
  onSubmit,
}) => {
  const isEditing = Boolean(teacher);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Mathematics & Science");
  const [qualification, setQualification] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (teacher) {
      setFirstName(teacher.firstName);
      setLastName(teacher.lastName);
      setEmail(teacher.email);
      setEmployeeCode(teacher.employeeCode);
      setPhone(teacher.phone || "");
      setDepartment(teacher.department || "Mathematics & Science");
      setQualification(teacher.qualification || "");
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setEmployeeCode(`TCH-2026-${Math.floor(100 + Math.random() * 900)}`);
      setPhone("");
      setDepartment("Mathematics & Science");
      setQualification("M.Sc. Mathematics, B.Ed");
    }
    setErrorMsg(null);
  }, [teacher, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("First and last name are required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("A valid faculty email address is required.");
      return;
    }
    if (!employeeCode.trim()) {
      setErrorMsg("Employee registration code is required.");
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      firstName,
      lastName,
      email,
      employeeCode,
      phone,
      department,
      qualification,
    });

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Failed to save teacher record.");
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? "Edit Faculty Profile" : "Register New Faculty Member"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Manage teacher contact info, department, and academic qualifications.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                First Name *
              </label>
              <Input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g., Sarah"
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
                placeholder="e.g., Jenkins"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Employee Code *
              </label>
              <Input
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="TCH-2026-001"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Faculty Email *
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="s.jenkins@academy.edu"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Phone Contact Number
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 24 000 0000"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="Early Grade">Early Grade</option>
                <option value="Lower Primary">Lower Primary</option>
                <option value="Upper Primary">Upper Primary</option>
                <option value="J.H.S">J.H.S</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Qualifications & Degrees
            </label>
            <Input
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g., M.Sc. Mathematics, B.Ed"
              className="h-8 text-xs"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 font-semibold">
              {isEditing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{loading ? "Saving..." : isEditing ? "Update Faculty Record" : "Register Teacher"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
