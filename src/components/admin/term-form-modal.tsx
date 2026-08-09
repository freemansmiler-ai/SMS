"use client";

import React, { useState, useEffect } from "react";
import { AcademicYearRecord, TermRecord, CreateTermPayload } from "@/lib/services/academic-years";
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
import { AlertCircle, Plus, Save, Clock } from "lucide-react";

interface TermFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYears: AcademicYearRecord[];
  termRecord?: TermRecord | null;
  defaultAcademicYearId?: string;
  onSubmit: (payload: CreateTermPayload) => Promise<{ success: boolean; error?: string }>;
}

export const TermFormModal: React.FC<TermFormModalProps> = ({
  open,
  onOpenChange,
  academicYears,
  termRecord,
  defaultAcademicYearId,
  onSubmit,
}) => {
  const isEditing = Boolean(termRecord);

  const [academicYearId, setAcademicYearId] = useState("");
  const [name, setName] = useState("Term 1");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-12-15");
  const [isCurrent, setIsCurrent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (termRecord) {
      setAcademicYearId(termRecord.academicYearId);
      setName(termRecord.name);
      setStartDate(termRecord.startDate);
      setEndDate(termRecord.endDate);
      setIsCurrent(termRecord.isCurrent);
    } else {
      setAcademicYearId(defaultAcademicYearId || (academicYears[0] ? academicYears[0].id : ""));
      setName("Term 1");
      setStartDate("2026-09-01");
      setEndDate("2026-12-15");
      setIsCurrent(false);
    }
    setErrorMsg(null);
  }, [termRecord, open, defaultAcademicYearId, academicYears]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!academicYearId) {
      setErrorMsg("Parent Academic Year selection is required.");
      return;
    }

    if (!name.trim()) {
      setErrorMsg("Term name is required.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMsg("Term start date must be strictly before end date.");
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      academicYearId,
      name: name.trim(),
      startDate,
      endDate,
      isCurrent,
    });

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Failed to save term record.");
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>{isEditing ? "Edit Academic Term" : "Create New Academic Term"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure term dates within the parent academic year session.
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
              Parent Academic Year *
            </label>
            <select
              disabled={isEditing}
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="">-- Select Academic Year --</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} ({ay.startDate} to {ay.endDate})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Term Name *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Term 1"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Term Start Date *
              </label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Term End Date *
              </label>
              <Input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCurrentTerm"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4"
            />
            <label htmlFor="isCurrentTerm" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Set as Current Active Term
            </label>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 font-semibold">
              {isEditing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{loading ? "Saving..." : isEditing ? "Update Term" : "Create Term"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
