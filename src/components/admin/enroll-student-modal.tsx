"use client";

import React, { useState, useEffect } from "react";
import { fetchStudents, StudentRecord } from "@/lib/services/students";
import { fetchClasses, ClassRecord } from "@/lib/services/classes";
import { fetchAcademicYears, AcademicYearRecord } from "@/lib/services/academic-years";
import { enrollStudent, EnrollStudentPayload } from "@/lib/services/enrollments";
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
import { AlertCircle, UserPlus, GraduationCap } from "lucide-react";

interface EnrollStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedStudentId?: string;
  onEnrolled: () => void;
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  open,
  onOpenChange,
  preselectedStudentId,
  onEnrolled,
}) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearRecord[]>([]);

  const [studentId, setStudentId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [rollNumber, setRollNumber] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      const [stus, clss, yrs] = await Promise.all([
        fetchStudents({ status: "active" }),
        fetchClasses({ status: "active" }),
        fetchAcademicYears(),
      ]);

      setStudents(stus);
      setClasses(clss);
      setAcademicYears(yrs);

      if (preselectedStudentId) {
        setStudentId(preselectedStudentId);
      } else if (stus.length > 0) {
        setStudentId(stus[0].id);
      }

      if (clss.length > 0) {
        setClassId(clss[0].id);
      }

      const activeYear = yrs.find((y) => y.isCurrent) || yrs[0];
      if (activeYear) {
        setAcademicYearId(activeYear.id);
      }
    };

    loadOptions();
    setErrorMsg(null);
  }, [open, preselectedStudentId]);

  const selectedClass = classes.find((c) => c.id === classId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentId) {
      setErrorMsg("Please select a student to enroll.");
      return;
    }
    if (!classId) {
      setErrorMsg("Please select a target class section.");
      return;
    }

    setLoading(true);
    const res = await enrollStudent({
      studentId,
      classId,
      academicYearId: academicYearId || undefined,
      rollNumber: rollNumber ? Number(rollNumber) : undefined,
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || "Failed to enroll student.");
      return;
    }

    onEnrolled();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>Enroll Student into Class Section</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Assign student class placement and roll number for the academic session.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 py-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Student *
            </label>
            <select
              disabled={Boolean(preselectedStudentId)}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.studentCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Target Class Section *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="">-- Select Class --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.studentCount}/{c.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Academic Year *
              </label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedClass && (
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                <span>Class Capacity Status</span>
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {selectedClass.studentCount} / {selectedClass.capacity} Enrolled
              </span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Roll Number (Optional)
            </label>
            <Input
              type="number"
              min={1}
              value={rollNumber || ""}
              onChange={(e) => setRollNumber(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Auto-generated if left empty"
              className="h-8 text-xs"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 font-semibold">
              <UserPlus className="h-3.5 w-3.5" />
              <span>{loading ? "Enrolling..." : "Enroll Student"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
