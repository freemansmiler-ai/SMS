"use client";

import React, { useState, useEffect } from "react";
import { AcademicYearRecord, CreateAcademicYearPayload } from "@/lib/services/academic-years";
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
import { AlertCircle, Plus, Save, Calendar } from "lucide-react";

interface AcademicYearFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYear?: AcademicYearRecord | null;
  onSubmit: (payload: CreateAcademicYearPayload) => Promise<{ success: boolean; error?: string }>;
}

export const AcademicYearFormModal: React.FC<AcademicYearFormModalProps> = ({
  open,
  onOpenChange,
  academicYear,
  onSubmit,
}) => {
  const isEditing = Boolean(academicYear);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2027-07-31");
  const [isCurrent, setIsCurrent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (academicYear) {
      setName(academicYear.name);
      setStartDate(academicYear.startDate);
      setEndDate(academicYear.endDate);
      setIsCurrent(academicYear.isCurrent);
    } else {
      setName("2026/2027 Academic Year");
      setStartDate("2026-09-01");
      setEndDate("2027-07-31");
      setIsCurrent(false);
    }
    setErrorMsg(null);
  }, [academicYear, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Academic year name is required.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMsg("Start date must be strictly before end date.");
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      name: name.trim(),
      startDate,
      endDate,
      isCurrent,
    });

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Failed to save academic year.");
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>{isEditing ? "Edit Academic Year" : "Create New Academic Year"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure school session dates and set active current year status.
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
              Academic Year Name *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 2026/2027 Academic Year"
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Start Date *
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
                End Date *
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
              id="isCurrentYear"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4"
            />
            <label htmlFor="isCurrentYear" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Set as Current Active Academic Year
            </label>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 font-semibold">
              {isEditing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{loading ? "Saving..." : isEditing ? "Update Academic Year" : "Create Academic Year"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
