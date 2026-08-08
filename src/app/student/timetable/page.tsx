"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTimetableSlots, TimetableSlot } from "@/lib/services/timetable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

export default function StudentTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Strictly fetch slots for student's enrolled class section Basic 8 - Section A
      const data = await fetchTimetableSlots({ classId: "class-basic8a" });
      setSlots(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Dashboard", href: "/student" },
        { label: "Class Timetable" },
      ]}
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>Weekly Class Timetable</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Basic 8 - Section A Term 1 weekly subject schedule and room locations.
          </p>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Basic 8 - Section A Weekly Schedule</CardTitle>
            <CardDescription className="text-xs">
              Official subject period allocations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : slots.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No class timetable published yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Title</TableHead>
                    <TableHead>Subject Teacher</TableHead>
                    <TableHead className="text-right">Classroom / Venue</TableHead>
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
                      <TableCell className="text-xs font-mono font-semibold text-slate-500">
                        {slot.subjectCode}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {slot.subjectName}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                        {slot.teacherName}
                      </TableCell>
                      <TableCell className="text-right">
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
