"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchTimetableSlots, TimetableSlot, DAYS_OF_WEEK } from "@/lib/services/timetable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Filter, Building2 } from "lucide-react";

export default function PrincipalTimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchTimetableSlots({ classId: classFilter });
      setSlots(data);
      setLoading(false);
    };
    load();
  }, [classFilter]);

  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Executive Dashboard", href: "/principal" },
        { label: "Master School Timetable" },
      ]}
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>Master School Timetable Overview</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Headmaster executive master timetable schedule across all basic & SHS class divisions.
          </p>
        </div>

        {/* Filter Bar */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Class Division:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All School Classes</option>
                <option value="class-basic8a">Basic 8 - Section A</option>
                <option value="class-basic9b">Basic 9 - Section B</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Master Schedule Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Master Class Schedule</CardTitle>
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
                    <TableHead>Room</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-bold text-xs">{slot.day}</TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-slate-500">
                        {slot.startTime} - {slot.endTime}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{slot.className}</TableCell>
                      <TableCell className="font-bold text-xs">{slot.subjectName}</TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                        {slot.teacherName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {slot.room}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
