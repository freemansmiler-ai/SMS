"use client";

import React, { useState } from "react";
import { ClassRecord, deactivateClass } from "@/lib/services/classes";
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
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface DeactivateClassDialogProps {
  classRecord: ClassRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeactivated: () => void;
}

export const DeactivateClassDialog: React.FC<DeactivateClassDialogProps> = ({
  classRecord,
  open,
  onOpenChange,
  onDeactivated,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!classRecord) return null;

  const handleDeactivate = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await deactivateClass(classRecord.id);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to soft-deactivate class.");
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
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Soft-Deactivate Class Section</span>
          </DialogTitle>
          <DialogDescription className="text-xs pt-0.5">
            Are you sure you want to deactivate{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {classRecord.name}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2 text-xs">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Historical Data Preservation Guarantee</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Deactivating a class section changes its status without deleting any historical student enrollments, exam results, gradebooks, or attendance logs. All historical data remains linked to this class ID in PostgreSQL.
          </p>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
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
            {loading ? "Deactivating..." : "Deactivate Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
