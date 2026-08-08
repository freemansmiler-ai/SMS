"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchTimetableSlots,
  deleteTimetableSlot,
  TimetableSlot,
  DAYS_OF_WEEK,
  TIME_SLOTS,
} from "@/lib/services/timetable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddTimetableSlotModal } from "@/components/admin/add-timetable-slot-modal";
import { Calendar, Plus, Trash2, ShieldCheck, Filter, RefreshCw } from "lucide-react";

export default function AdminTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [classFilter, setClassFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchTimetableSlots({
      classId: classFilter,
      teacherId: teacherFilter,
      day: dayFilter,
    });
    setSlots(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [classFilter, teacherFilter, dayFilter]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this timetable period slot?")) {
      await deleteTimetableSlot(id);
      loadData();
    }
  };

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Admin Dashboard", href: "/admin" },
        { label: "Timetable Management" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>School Master Timetable Manager</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Create, schedule, and resolve classroom and faculty timetable period allocations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs gap-1">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Period Slot</span>
            </Button>
          </div>
        </div>

        {/* Conflict Protection Notice */}
        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-900/30 border border-emerald-200/70 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">
            Automated Conflict Prevention Active: Teacher double-booking and room overlap detection runs automatically upon period scheduling.
          </span>
        </div>

        {/* Filters */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />

              {/* Class Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Class:</span>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Classes</option>
                  <option value="class-basic8a">Basic 8 - Section A</option>
                  <option value="class-basic9b">Basic 9 - Section B</option>
                </select>
              </div>

              {/* Teacher Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Teacher:</span>
                <select
                  value={teacherFilter}
                  onChange={(e) => setTeacherFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Faculty Teachers</option>
                  <option value="tch-201">Abena Appiah</option>
                  <option value="tch-202">Kofi Acheampong</option>
                </select>
              </div>

              {/* Day Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Day:</span>
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Days</option>
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Master Timetable Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Scheduled Master Timetable Slots</CardTitle>
            <CardDescription className="text-xs">
              Showing {slots.length} period slots across class sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Class Section</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Faculty Teacher</TableHead>
                    <TableHead>Room / Venue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {slot.day}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                        {slot.startTime} - {slot.endTime}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{slot.className}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {slot.subjectName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {slot.subjectCode}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                        {slot.teacherName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {slot.room}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(slot.id)}
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete slot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Slot Modal */}
      <AddTimetableSlotModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={loadData}
      />
    </DashboardShell>
  );
}
