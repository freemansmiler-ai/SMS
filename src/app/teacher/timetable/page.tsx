"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTimetableSlots, TimetableSlot } from "@/lib/services/timetable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, BookOpen, Clock } from "lucide-react";

export default function TeacherTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Strictly fetch slots assigned to Abena Appiah / logged-in teacher
      const data = await fetchTimetableSlots({ teacherId: "tch-201" });
      setSlots(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <DashboardShell
      role="teacher"
      breadcrumbs={[
        { label: "Teacher Dashboard", href: "/teacher" },
        { label: "My Teaching Schedule" },
      ]}
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>My Teaching Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized weekly period allocations for your assigned classes and subjects.
          </p>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Weekly Teaching Timetable</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : slots.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No teaching periods scheduled currently.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Assigned Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Classroom / Venue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {slot.day}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-slate-500">
                        {slot.startTime} - {slot.endTime}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {slot.className}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {slot.subjectName} ({slot.subjectCode})
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {slot.room}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
