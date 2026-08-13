"use client";

import React, { useState } from "react";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateAnnouncementModal } from "@/components/announcements/create-announcement-modal";
import { Megaphone, UserPlus, BookPlus, ShieldCheck, Plus, Check } from "lucide-react";

export const QuickActions: React.FC = () => {
  const { activeRole } = useRole();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);

  const handleActionClick = (modalId: string) => {
    if (modalId === "new_announcement") {
      setAnnouncementModalOpen(true);
      return;
    }
    setSubmitted(false);
    setActiveModal(modalId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setActiveModal(null);
      setSubmitted(false);
    }, 1000);
  };

  return (
    <>
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-sm font-semibold">Quick Administrative Actions</CardTitle>
          <CardDescription className="text-xs">
            Standard workflow shortcuts for {activeRole} role.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-4 pt-0">
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border-slate-200/80 dark:border-slate-800"
            onClick={() => handleActionClick("new_announcement")}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Megaphone className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                Broadcast Notice
              </span>
              <p className="text-[11px] text-slate-500 font-normal">
                Post school announcement
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border-slate-200/80 dark:border-slate-800"
            onClick={() => handleActionClick("register_user")}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                Register Profile
              </span>
              <p className="text-[11px] text-slate-500 font-normal">
                Add student or faculty record
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border-slate-200/80 dark:border-slate-800"
            onClick={() => handleActionClick("create_course")}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <BookPlus className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                Class Setup
              </span>
              <p className="text-[11px] text-slate-500 font-normal">
                Configure subject section
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border-slate-200/80 dark:border-slate-800"
            onClick={() => handleActionClick("security_check")}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                Security Policy
              </span>
              <p className="text-[11px] text-slate-500 font-normal">
                Audit RBAC permissions
              </p>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Action Dialog Modal */}
      <Dialog open={Boolean(activeModal)} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {activeModal === "register_user" && "Register New Profile Record"}
              {activeModal === "create_course" && "Create New Academic Subject"}
              {activeModal === "security_check" && "System RBAC Policy Status"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Demonstrating modal layout, form controls, and button states.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-6 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Action Executed Successfully
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 py-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Title / Subject Reference
                </label>
                <Input
                  required
                  placeholder="Enter reference title..."
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Description / Context
                </label>
                <Input
                  placeholder="Enter brief description..."
                  className="text-xs h-8"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Submit Action</span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Real Announcement Broadcast Modal */}
      <CreateAnnouncementModal
        open={announcementModalOpen}
        onOpenChange={setAnnouncementModalOpen}
        onSuccess={() => setAnnouncementModalOpen(false)}
      />
    </>
  );
};
