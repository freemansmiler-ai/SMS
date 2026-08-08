"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { PrincipalMetricsGrid } from "@/components/principal/principal-metrics-grid";
import { ClassPerformanceChart } from "@/components/principal/class-performance-chart";
import { SubjectPerformanceChart } from "@/components/principal/subject-performance-chart";
import { ResultApprovalStatusCard } from "@/components/principal/result-approval-status-card";
import {
  fetchPrincipalDashboardData,
  PrincipalDashboardData,
} from "@/lib/services/principal-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function PrincipalDashboardPage() {
  const [data, setData] = useState<PrincipalDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPrincipalDashboardData();
      setData(res);
    } catch {
      setError("Failed to query executive analytics from database. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardShell role="principal" breadcrumbs={[{ label: "Executive Dashboard" }]}>
      <div className="space-y-5">
        {/* Welcome Executive Header */}
        <WelcomeBanner />

        {/* Error Alert State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadData} className="h-7 text-xs gap-1">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Principal Executive Metrics Grid */}
        <PrincipalMetricsGrid metrics={data?.metrics ?? null} loading={loading} />

        {/* Result Submission & Approval Workflow Overview */}
        <ResultApprovalStatusCard status={data?.resultStatus ?? null} loading={loading} />

        {/* Analytics Breakdown Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          <ClassPerformanceChart data={data?.classPerformance ?? []} loading={loading} />
          <SubjectPerformanceChart data={data?.subjectPerformance ?? []} loading={loading} />
        </div>
      </div>
    </DashboardShell>
  );
}
