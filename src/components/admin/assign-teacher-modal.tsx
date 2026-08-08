"use client";

import React, { useState } from "react";
import { TeacherRecord, assignTeacherToSubjectAndClass } from "@/lib/services/teachers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface AssignTeacherModalProps {
  teacher: TeacherRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}

const AVAILABLE_SUBJECTS = [
  { id: "subj-math101", code: "MATH-101", name: "Core Mathematics" },
  { id: "subj-sci101", code: "SCI-101", name: "Integrated Science" },
  { id: "subj-eng101", code: "ENG-101", name: "Core English Language" },
  { id: "subj-soc101", code: "SOC-101", name: "Social Studies" },
  { id: "subj-ict101", code: "ICT-101", name: "Information & Comms Tech (ICT)" },
  { id: "subj-rme101", code: "RME-101", name: "Religious & Moral Education (R.M.E)" },
];

const AVAILABLE_CLASSES = [
  { id: "class-basic7a", name: "Basic 7 - Section A" },
  { id: "class-basic7b", name: "Basic 7 - Section B" },
  { id: "class-basic8a", name: "Basic 8 - Section A" },
  { id: "class-basic8b", name: "Basic 8 - Section B" },
  { id: "class-basic9a", name: "Basic 9 - Section A" },
  { id: "class-shs1sci", name: "SHS 1 Science" },
];

export const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  teacher,
  open,
  onOpenChange,
  onAssigned,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(AVAILABLE_SUBJECTS[0].id);
  const [selectedClassId, setSelectedClassId] = useState(AVAILABLE_CLASSES[0].id);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!teacher) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const subjectObj = AVAILABLE_SUBJECTS.find((s) => s.id === selectedSubjectId)!;
    const classObj = AVAILABLE_CLASSES.find((c) => c.id === selectedClassId)!;

    const res = await assignTeacherToSubjectAndClass(teacher.id, {
      subjectId: subjectObj.id,
      subjectName: subjectObj.name,
      subjectCode: subjectObj.code,
      classId: classObj.id,
      className: classObj.name,
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || "Failed to create relational assignment.");
      return;
    }

    teacher.assignments.push({
      id: `asgn-${Date.now()}`,
      subjectId: subjectObj.id,
      subjectName: subjectObj.name,
      subjectCode: subjectObj.code,
      classId: classObj.id,
      className: classObj.name,
    });

    onAssigned();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            Assign GES Subject & Class Section
          </DialogTitle>
          <DialogDescription className="text-xs pt-0.5">
            Relational PostgreSQL Assignment for:{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {teacher.firstName} {teacher.lastName} ({teacher.employeeCode})
            </span>
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleAssign} className="space-y-3 py-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Select GES Curriculum Subject *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
            >
              {AVAILABLE_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Select Class Section (Basic / SHS) *
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
            >
              {AVAILABLE_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Relational Assignment Constraint</span>
            </div>
            <p className="leading-relaxed">
              This record will be saved in <code className="font-mono text-[10px]">teacher_assignments</code> linked by foreign keys to <code className="font-mono text-[10px]">teachers</code>, <code className="font-mono text-[10px]">subjects</code>, and <code className="font-mono text-[10px]">classes</code>.
            </p>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>{loading ? "Assigning..." : "Create Assignment"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
