"use client";

import React, { useState, useEffect } from "react";
import { SubjectRecord, CreateSubjectPayload } from "@/lib/services/subjects";
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
import { AlertCircle, Plus, Save, BookOpen } from "lucide-react";

interface SubjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectRecord?: SubjectRecord | null;
  onSubmit: (payload: CreateSubjectPayload) => Promise<{ success: boolean; error?: string }>;
}

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  open,
  onOpenChange,
  subjectRecord,
  onSubmit,
}) => {
  const isEditing = Boolean(subjectRecord);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (subjectRecord) {
      setCode(subjectRecord.code);
      setName(subjectRecord.name);
      setDescription(subjectRecord.description || "");
    } else {
      setCode("");
      setName("");
      setDescription("");
    }
    setErrorMsg(null);
  }, [subjectRecord, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code.trim()) {
      setErrorMsg("Subject code is required.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Subject title is required.");
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: description.trim(),
    });

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Failed to save subject record.");
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span>{isEditing ? "Edit Subject Record" : "Add New Curriculum Subject"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Manage subject code, title, and course syllabus overview.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 py-1 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1 col-span-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Subject Code *
              </label>
              <Input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MATH-101"
                className="h-8 text-xs font-mono uppercase"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Subject Title *
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Core Mathematics"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Syllabus & Course Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of topics covered in this subject..."
              className="h-8 text-xs"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5 font-semibold">
              {isEditing ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{loading ? "Saving..." : isEditing ? "Update Subject" : "Create Subject"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
