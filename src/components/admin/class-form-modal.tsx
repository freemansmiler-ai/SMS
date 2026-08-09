"use client";

import React, { useState, useEffect } from "react";
import { ClassRecord, CreateClassPayload } from "@/lib/services/classes";
import { fetchTeachers, TeacherRecord } from "@/lib/services/teachers";
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
import { AlertCircle, Plus, Save, School } from "lucide-react";

interface ClassFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classRecord?: ClassRecord | null;
  onSubmit: (payload: CreateClassPayload) => Promise<{ success: boolean; error?: string }>;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  open,
  onOpenChange,
  classRecord,
  onSubmit,
}) => {
  const isEditing = Boolean(classRecord);

  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("Basic 8");
  const [section, setSection] = useState("Section A");
  const [capacity, setCapacity] = useState<number>(35);
  const [classTeacherId, setClassTeacherId] = useState<string>("");

  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    fetchTeachers().then((data) => setTeachers(data.filter((t) => t.isActive)));

    if (classRecord) {
      setName(classRecord.name);
      setGradeLevel(classRecord.gradeLevel);
      setSection(classRecord.section || "");
      setCapacity(classRecord.capacity || 35);
      setClassTeacherId(classRecord.classTeacherId || "");
    } else {
      setName("Basic 8 - Section A");
      setGradeLevel("Basic 8");
      setSection("Section A");
      setCapacity(35);
      setClassTeacherId("");
    }
    setErrorMsg(null);
  }, [classRecord, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Class section name is required.");
      return;
    }

    if (capacity <= 0) {
      setErrorMsg("Capacity must be a positive number.");
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      name,
      gradeLevel,
      section,
      capacity: Number(capacity),
      classTeacherId: classTeacherId || undefined,
    });

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Failed to save class record.");
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <School className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>{isEditing ? "Edit Class Section" : "Add New Class Section"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Manage academic class division, student capacity limit, and assigned class teacher.
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
              Class Section Name *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Basic 8 - Section A"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Grade Level *
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="Early Grade">Early Grade</option>
                <option value="Lower Primary">Lower Primary</option>
                <option value="Upper Primary">Upper Primary</option>
                <option value="Basic 7">Basic 7</option>
                <option value="Basic 8">Basic 8</option>
                <option value="Basic 9">Basic 9</option>
                <option value="SHS 1">SHS 1</option>
                <option value="SHS 2">SHS 2</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Section / Division
              </label>
              <Input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g., Section A"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Student Capacity *
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Class Teacher
              </label>
              <select
                value={classTeacherId}
                onChange={(e) => setClassTeacherId(e.target.value)}
                className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">-- Select Class Teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 font-semibold">
              {isEditing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{loading ? "Saving..." : isEditing ? "Update Class" : "Create Class"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
