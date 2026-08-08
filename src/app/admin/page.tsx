"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { AdminMetricsGrid } from "@/components/admin/admin-metrics-grid";
import { RecentRegistrations } from "@/components/admin/recent-registrations";
import { RecentSystemActivity } from "@/components/admin/recent-system-activity";
import { ResultSubmissionStatus } from "@/components/admin/result-submission-status";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  fetchAdminDashboardData,
  AdminMetrics,
  RecentUserRegistration,
  RecentAuditLog,
  ResultStatusSummary,
} from "@/lib/services/admin-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<RecentUserRegistration[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentAuditLog[]>([]);
  const [resultStatus, setResultStatus] = useState<ResultStatusSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDashboardData();
      setMetrics(data.metrics);
      setRecentRegistrations(data.recentRegistrations);
      setRecentLogs(data.recentAuditLogs);
      setResultStatus(data.resultStatus);
    } catch {
      setError("Failed to query Administrator metrics from database. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardShell role="administrator">
      <div className="space-y-5">
        {/* Welcome Executive Header */}
        <WelcomeBanner />

        {/* Error Alert State if database fetch fails */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Database Connection Notice</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadData} className="h-7 text-xs gap-1">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Administrator Core Metrics Grid */}
        <AdminMetricsGrid metrics={metrics} loading={loading} />

        {/* Quick Actions Shortcuts */}
        <QuickActions />

        {/* Two-column layout for Activity Streams & Registration Data */}
        <div className="grid gap-5 lg:grid-cols-2">
          <RecentRegistrations registrations={recentRegistrations} loading={loading} />
          <div className="space-y-5">
            <ResultSubmissionStatus status={resultStatus} loading={loading} />
            <RecentSystemActivity logs={recentLogs} loading={loading} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
