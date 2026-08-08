"use client";

import React, { useState } from "react";
import { TeacherRecord, deactivateTeacher } from "@/lib/services/teachers";
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
import { ShieldAlert, AlertTriangle } from "lucide-react";

interface DeactivateTeacherDialogProps {
  teacher: TeacherRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeactivated: () => void;
}

export const DeactivateTeacherDialog: React.FC<DeactivateTeacherDialogProps> = ({
  teacher,
  open,
  onOpenChange,
  onDeactivated,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!teacher) return null;

  const handleDeactivate = async () => {
    setLoading(true);
    setErrorMsg(null);

    const result = await deactivateTeacher(teacher.id);

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Failed to deactivate faculty profile.");
      return;
    }

    onDeactivated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4" />
            Deactivate Faculty Member
          </DialogTitle>
          <DialogDescription className="text-xs pt-1">
            You are about to change active status for teacher:{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {teacher.firstName} {teacher.lastName} ({teacher.employeeCode})
            </span>
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-md text-xs space-y-2">
          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Deactivating this faculty member pauses active system privileges. All assigned subjects, previous gradebooks, and historical timetable records remain preserved.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={handleDeactivate}
            className="font-semibold"
          >
            {loading ? "Deactivating..." : "Confirm Deactivation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
