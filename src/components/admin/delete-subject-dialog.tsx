"use client";

import React, { useState } from "react";
import { SubjectRecord, deactivateSubject, reactivateSubject, deleteSubject } from "@/lib/services/subjects";
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
import { Trash2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";

interface DeleteSubjectDialogProps {
  subjectRecord: SubjectRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete?: () => void;
  onDeleted?: () => void;
}

export const DeleteSubjectDialog: React.FC<DeleteSubjectDialogProps> = ({
  subjectRecord,
  open,
  onOpenChange,
  onActionComplete,
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!subjectRecord) return null;

  const isInactive = subjectRecord.status === "inactive";

  const notifyComplete = () => {
    if (onActionComplete) onActionComplete();
    if (onDeleted) onDeleted();
  };

  const handleDeactivate = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await deactivateSubject(subjectRecord.id);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to deactivate subject.");
      return;
    }

    notifyComplete();
    onOpenChange(false);
  };

  const handleReactivate = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await reactivateSubject(subjectRecord.id);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to reactivate subject.");
      return;
    }

    notifyComplete();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await deleteSubject(subjectRecord.id);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to delete subject.");
      return;
    }

    notifyComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{isInactive ? "Reactivate or Remove Subject" : "Deactivate / Delete Subject"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs pt-0.5">
            Subject:{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {subjectRecord.code} - {subjectRecord.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Data Integrity & Historical Preservation</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Deactivating a subject prevents it from being assigned to new classes or teachers. All historical exam marks, results, and past assignments remain permanently intact.
          </p>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {isInactive ? (
            <Button
              variant="default"
              size="sm"
              disabled={loading}
              onClick={handleReactivate}
              className="font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reactivate Subject</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={handleDeactivate}
              className="font-semibold gap-1.5 text-amber-700 dark:text-amber-300 border-amber-300"
            >
              <span>Soft Deactivate</span>
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={handleDelete}
            className="font-semibold gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Permanently</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
