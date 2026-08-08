"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { TeacherMetricsGrid } from "@/components/teacher/teacher-metrics-grid";
import { MySubjectsSection } from "@/components/teacher/my-subjects-section";
import { MyClassesSection } from "@/components/teacher/my-classes-section";
import { TeacherActivities } from "@/components/teacher/teacher-activities";
import {
  fetchTeacherDashboardData,
  TeacherDashboardData,
} from "@/lib/services/teacher-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTeacherDashboardData();
      setData(res);
    } catch {
      setError("Failed to load your assigned subjects and classes from the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardShell role="teacher" breadcrumbs={[{ label: "Teacher Dashboard" }]}>
      <div className="space-y-5">
        {/* Welcome Header */}
        <WelcomeBanner />

        {/* Security Isolation Notice */}
        <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200/70 dark:border-blue-800 text-xs flex items-center justify-between gap-3 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-medium">
              Strict Assignment Isolation Active: Displaying only subjects and classes relationally assigned to your faculty profile.
            </span>
          </div>
        </div>

        {/* Error Alert State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadDashboard} className="h-7 text-xs gap-1">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Teacher Core Assignment Metrics */}
        <TeacherMetricsGrid metrics={data?.metrics ?? null} loading={loading} />

        {/* Two-column layout for My Subjects and My Classes */}
        <div className="grid gap-5 lg:grid-cols-2">
          <MySubjectsSection subjects={data?.assignedSubjects ?? []} loading={loading} />
          <MyClassesSection classes={data?.assignedClasses ?? []} loading={loading} />
        </div>

        {/* Recent Class Activities */}
        <TeacherActivities activities={data?.recentActivities ?? []} loading={loading} />
      </div>
    </DashboardShell>
  );
}
