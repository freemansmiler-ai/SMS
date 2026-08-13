"use client";

import React, { useState } from "react";
import {
  createAnnouncement,
  TargetAudience,
  AnnouncementStatus,
} from "@/lib/services/announcements";
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
import { Megaphone, Send, AlertCircle } from "lucide-react";

interface CreateAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  authorName?: string;
  authorRole?: string;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  authorName = "Dr. kpogli Freeman",
  authorRole = "Headmaster",
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("Entire School");
  const [targetClassId, setTargetClassId] = useState("class-basic8a");
  const [targetClassName, setTargetClassName] = useState("Basic 8 - Section A");
  const [status, setStatus] = useState<AnnouncementStatus>("published");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Please provide both announcement title and notice content.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await createAnnouncement({
      title,
      content,
      author: authorName,
      authorRole,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      targetAudience,
      targetClassId: targetAudience === "Specific Classes" ? targetClassId : undefined,
      targetClassName: targetAudience === "Specific Classes" ? targetClassName : undefined,
      status,
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to publish announcement.");
      return;
    }

    setTitle("");
    setContent("");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            Compose Official Announcement
          </DialogTitle>
          <DialogDescription className="text-xs">
            Broadcast official school notices to faculty members, students, or specific classes.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 py-1 text-xs">
          {/* Title */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Announcement Title:
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Term 1 BECE Mock Examinations Schedule"
              className="h-8 text-xs font-bold"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Target Audience:
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
              className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 font-semibold text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="Entire School">All (Teachers & Students)</option>
              <option value="Teachers">Teachers Only</option>
              <option value="Students">Students Only</option>
            </select>
          </div>

          {/* Notice Content */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notice Content Details:
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter announcement details, schedules, or instructions..."
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs font-medium shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Publication Status */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Publication Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
              className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 font-semibold text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="published">Publish Immediately</option>
              <option value="draft">Save as Draft</option>
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? "Publishing..." : "Broadcast Notice"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
