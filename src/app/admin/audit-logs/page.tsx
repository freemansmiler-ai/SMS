"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchAuditLogs,
  AuditLogEntry,
  AuditLogAction,
} from "@/lib/services/audit-logs";
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
import {
  ShieldAlert,
  Filter,
  RefreshCw,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchAuditLogs({
      action: actionFilter,
      entity: entityFilter,
    });
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, entityFilter]);

  const getActionBadge = (action: AuditLogAction) => {
    switch (action) {
      case "RESULT_APPROVAL":
      case "RESULT_PUBLICATION":
        return <Badge variant="success" className="text-[10px]">{action}</Badge>;
      case "RESULT_REJECTION":
      case "ACCOUNT_DEACTIVATION":
        return <Badge variant="destructive" className="text-[10px]">{action}</Badge>;
      case "STUDENT_CREATION":
      case "TEACHER_CREATION":
        return <Badge variant="default" className="text-[10px]">{action}</Badge>;
      case "SCORE_SUBMISSION":
      case "ATTENDANCE_MODIFICATION":
        return <Badge variant="warning" className="text-[10px]">{action}</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{action}</Badge>;
    }
  };

  return (
    <DashboardShell
      role="administrator"
      breadcrumbs={[
        { label: "Admin Dashboard", href: "/admin" },
        { label: "System Audit Logs" },
      ]}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <span>Comprehensive System Audit Logs</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Full audit trail recording authentication, student/teacher modifications, score submissions, and approvals.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={loadLogs} className="h-8 text-xs gap-1">
            <RefreshCw className="h-3 w-3" />
            Refresh Stream
          </Button>
        </div>

        {/* Security Rule Notice */}
        <div className="p-3 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-purple-400 shrink-0" />
            <span className="font-medium">
              Administrator Security Access: System-wide audit trails are restricted from student and teacher roles.
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />

              {/* Action Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Action:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Actions</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="LOGOUT">LOGOUT</option>
                  <option value="STUDENT_CREATION">STUDENT_CREATION</option>
                  <option value="STUDENT_MODIFICATION">STUDENT_MODIFICATION</option>
                  <option value="TEACHER_CREATION">TEACHER_CREATION</option>
                  <option value="SCORE_SUBMISSION">SCORE_SUBMISSION</option>
                  <option value="RESULT_APPROVAL">RESULT_APPROVAL</option>
                  <option value="RESULT_REJECTION">RESULT_REJECTION</option>
                  <option value="ATTENDANCE_MODIFICATION">ATTENDANCE_MODIFICATION</option>
                  <option value="ACCOUNT_DEACTIVATION">ACCOUNT_DEACTIVATION</option>
                </select>
              </div>

              {/* Entity Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Entity:</span>
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Entities</option>
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="results">results</option>
                  <option value="attendance">attendance</option>
                  <option value="auth">auth</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-sm font-semibold">Audit Stream Records</CardTitle>
            <CardDescription className="text-xs">
              Showing {logs.length} recorded audit events.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Audit Logs Found"
                  description="No audit trail events match the selected filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User / Actor</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action Event</TableHead>
                    <TableHead>Target Entity</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Audit Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {log.userName}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-500">
                        {log.userRole}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        {log.entity} ({log.entityId})
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-500">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300 font-medium max-w-xs truncate" title={log.details}>
                        {log.details}
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
