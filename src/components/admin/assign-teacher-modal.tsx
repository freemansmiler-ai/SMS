"use client";

import React, { useState, useEffect } from "react";
import { TeacherRecord, assignTeacherToSubjectAndClass } from "@/lib/services/teachers";
import { createBrowserClient, getSupabaseEnvConfig } from "@/lib/supabase";
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

interface SelectOption {
  id: string;
  label: string;
}

const DEFAULT_SUBJECTS = [
  { id: "subj-math101", label: "MATH-101 - Core Mathematics" },
  { id: "subj-sci101", label: "SCI-101 - Integrated Science" },
  { id: "subj-eng101", label: "ENG-101 - Core English Language" },
  { id: "subj-soc101", label: "SOC-101 - Social Studies" },
  { id: "subj-ict101", label: "ICT-101 - Information & Comms Tech (ICT)" },
  { id: "subj-rme101", label: "RME-101 - Religious & Moral Education (R.M.E)" },
];

const DEFAULT_CLASSES = [
  { id: "class-basic7a", label: "Basic 7 - Section A" },
  { id: "class-basic7b", label: "Basic 7 - Section B" },
  { id: "class-basic8a", label: "Basic 8 - Section A" },
  { id: "class-basic8b", label: "Basic 8 - Section B" },
  { id: "class-basic9a", label: "Basic 9 - Section A" },
  { id: "class-basic9b", label: "Basic 9 - Section B" },
];

export const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  teacher,
  open,
  onOpenChange,
  onAssigned,
}) => {
  const [subjects, setSubjects] = useState<SelectOption[]>(DEFAULT_SUBJECTS);
  const [classes, setClasses] = useState<SelectOption[]>(DEFAULT_CLASSES);
  const [academicYears, setAcademicYears] = useState<SelectOption[]>([]);
  const [terms, setTerms] = useState<SelectOption[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      const config = getSupabaseEnvConfig();
      if (config.isPlaceholder || !config.isConfigured) {
        setSubjects(DEFAULT_SUBJECTS);
        setClasses(DEFAULT_CLASSES);
        setSelectedSubjectId(DEFAULT_SUBJECTS[0].id);
        setSelectedClassId(DEFAULT_CLASSES[0].id);
        return;
      }

      setFetchingOptions(true);
      const supabase = createBrowserClient();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [subjRes, classRes, yearRes, termRes] = await Promise.all([
          // Use status column (not is_active — that column does not exist on subjects)
          (supabase.from("subjects") as any).select("id, code, name").neq("status", "inactive"),
          (supabase.from("classes") as any).select("id, name"),
          (supabase.from("academic_years") as any).select("id, name"),
          (supabase.from("terms") as any).select("id, name"),
        ]);

        if (subjRes.data && subjRes.data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dbSubjs = subjRes.data.map((s: any) => ({ id: s.id, label: `${s.code} - ${s.name}` }));
          setSubjects(dbSubjs);
          setSelectedSubjectId(dbSubjs[0].id);
        } else {
          setSubjects(DEFAULT_SUBJECTS);
          setSelectedSubjectId(DEFAULT_SUBJECTS[0].id);
        }

        if (classRes.data && classRes.data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dbClasses = classRes.data.map((c: any) => ({ id: c.id, label: c.name }));
          setClasses(dbClasses);
          setSelectedClassId(dbClasses[0].id);
        } else {
          setClasses(DEFAULT_CLASSES);
          setSelectedClassId(DEFAULT_CLASSES[0].id);
        }

        if (yearRes.data && yearRes.data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dbYears = yearRes.data.map((y: any) => ({ id: y.id, label: y.name }));
          setAcademicYears(dbYears);
          setSelectedYearId(dbYears[0].id);
        }

        if (termRes.data && termRes.data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dbTerms = termRes.data.map((t: any) => ({ id: t.id, label: t.name }));
          setTerms(dbTerms);
          setSelectedTermId(dbTerms[0].id);
        }
      } catch {
        setSubjects(DEFAULT_SUBJECTS);
        setClasses(DEFAULT_CLASSES);
        setSelectedSubjectId(DEFAULT_SUBJECTS[0].id);
        setSelectedClassId(DEFAULT_CLASSES[0].id);
      } finally {
        setFetchingOptions(false);
      }
    };

    loadOptions();
  }, [open]);

  if (!teacher) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!selectedSubjectId || !selectedClassId) {
      setErrorMsg("Subject and Class Section selections are required.");
      setLoading(false);
      return;
    }

    const res = await assignTeacherToSubjectAndClass(teacher.id, {
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      academicYearId: selectedYearId || undefined,
      termId: selectedTermId || undefined,
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || "Failed to create relational assignment.");
      return;
    }

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
              disabled={fetchingOptions}
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Select Class Section (Basic 1-9) *
            </label>
            <select
              disabled={fetchingOptions}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {academicYears.length > 0 && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Academic Session
              </label>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {terms.length > 0 && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Academic Term
              </label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <Button type="submit" size="sm" disabled={loading || fetchingOptions} className="gap-1.5 font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>{loading ? "Assigning..." : "Create Assignment"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
