"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear,
  createTerm,
  updateTerm,
  setCurrentTerm,
  AcademicYearRecord,
  TermRecord,
  CreateAcademicYearPayload,
  CreateTermPayload,
} from "@/lib/services/academic-years";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AcademicYearFormModal } from "@/components/admin/academic-year-form-modal";
import { TermFormModal } from "@/components/admin/term-form-modal";
import {
  Calendar,
  Plus,
  Edit,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AcademicYearManagementPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYearRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYearRecord | null>(null);

  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<TermRecord | null>(null);
  const [selectedYearIdForTerm, setSelectedYearIdForTerm] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAcademicYears();
    setAcademicYears(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentYear = academicYears.find((ay) => ay.isCurrent);
  const currentTerm = currentYear?.terms.find((t) => t.isCurrent);

  const handleOpenAddYear = () => {
    setEditingYear(null);
    setIsYearModalOpen(true);
  };

  const handleOpenEditYear = (ay: AcademicYearRecord) => {
    setEditingYear(ay);
    setIsYearModalOpen(false);
    setTimeout(() => setIsYearModalOpen(true), 50);
  };

  const handleYearSubmit = async (payload: CreateAcademicYearPayload) => {
    if (editingYear) {
      const res = await updateAcademicYear(editingYear.id, payload);
      if (res.success) loadData();
      return res;
    } else {
      const res = await createAcademicYear(payload);
      if (res.success) loadData();
      return res;
    }
  };

  const handleSetCurrentYear = async (id: string) => {
    const res = await setCurrentAcademicYear(id);
    if (res.success) loadData();
  };

  const handleOpenAddTerm = (yearId?: string) => {
    setEditingTerm(null);
    setSelectedYearIdForTerm(yearId || (academicYears[0]?.id || ""));
    setIsTermModalOpen(true);
  };

  const handleOpenEditTerm = (t: TermRecord) => {
    setEditingTerm(t);
    setSelectedYearIdForTerm(t.academicYearId);
    setIsTermModalOpen(false);
    setTimeout(() => setIsTermModalOpen(true), 50);
  };

  const handleTermSubmit = async (payload: CreateTermPayload) => {
    if (editingTerm) {
      const res = await updateTerm(editingTerm.id, payload);
      if (res.success) loadData();
      return res;
    } else {
      const res = await createTerm(payload);
      if (res.success) loadData();
      return res;
    }
  };

  const handleSetCurrentTerm = async (id: string) => {
    const res = await setCurrentTerm(id);
    if (res.success) loadData();
  };

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Academic Session & Term Management" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Academic Years & Terms</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage school session schedules, term dates, and active current academic period.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={() => handleOpenAddTerm()} variant="outline" size="sm" className="gap-1.5 font-semibold text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Term</span>
            </Button>
            <Button onClick={handleOpenAddYear} size="sm" className="gap-1.5 font-semibold text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Academic Year</span>
            </Button>
          </div>
        </div>

        {/* Current Active Period Banner */}
        <Card className="border-slate-900 bg-slate-900 text-white dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Active Academic Period
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-50">
                    {currentYear ? currentYear.name : "2026/2027 Academic Year"}
                  </h3>
                  <Badge variant="success" className="text-[10px]">
                    {currentTerm ? currentTerm.name : "Term 1"} Active
                  </Badge>
                </div>
              </div>
            </div>

            {currentYear && (
              <div className="text-xs text-slate-400 flex items-center gap-4">
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">Session Span</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {currentYear.startDate} → {currentYear.endDate}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Years List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : academicYears.length === 0 ? (
          <EmptyState
            title="No Academic Years Configured"
            description="Click 'Add Academic Year' to define the school calendar session and terms."
            actionLabel="Add Academic Year"
            onAction={handleOpenAddYear}
          />
        ) : (
          <div className="space-y-5">
            {academicYears.map((ay) => (
              <Card key={ay.id} className="border-slate-200/80 dark:border-slate-800">
                <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold">{ay.name}</CardTitle>
                      {ay.isCurrent ? (
                        <Badge variant="success" className="text-[10px]">
                          Active Current Year
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Historical
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs font-mono">
                      Session Duration: {ay.startDate} to {ay.endDate}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {!ay.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCurrentYear(ay.id)}
                        className="h-7 text-xs gap-1 font-semibold"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Set Current Year</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditYear(ay)}
                      className="h-7 text-xs gap-1 font-semibold"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit Year</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenAddTerm(ay.id)}
                      className="h-7 text-xs gap-1 font-semibold"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Term</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="border-t border-slate-100 dark:border-slate-800">
                    {ay.terms.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No terms defined for this academic year yet.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Term Name</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ay.terms.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{t.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                {t.startDate}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                {t.endDate}
                              </TableCell>
                              <TableCell>
                                {t.isCurrent ? (
                                  <Badge variant="success" className="text-[9px]">
                                    Active Term
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px]">
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!t.isCurrent && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSetCurrentTerm(t.id)}
                                      className="h-6 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                                    >
                                      Set Current
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenEditTerm(t)}
                                    className="h-6 text-[10px] font-semibold"
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Year Modal */}
      <AcademicYearFormModal
        open={isYearModalOpen}
        onOpenChange={setIsYearModalOpen}
        academicYear={editingYear}
        onSubmit={handleYearSubmit}
      />

      {/* Term Modal */}
      <TermFormModal
        open={isTermModalOpen}
        onOpenChange={setIsTermModalOpen}
        academicYears={academicYears}
        termRecord={editingTerm}
        defaultAcademicYearId={selectedYearIdForTerm}
        onSubmit={handleTermSubmit}
      />
    </DashboardShell>
  );
}
