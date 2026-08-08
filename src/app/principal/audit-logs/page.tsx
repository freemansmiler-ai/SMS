"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  fetchAuditLogs,
  AuditLogEntry,
} from "@/lib/services/audit-logs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function PrincipalAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchAuditLogs({ roleScope: "principal" });
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <DashboardShell
      role="principal"
      breadcrumbs={[
        { label: "Executive Dashboard", href: "/principal" },
        { label: "Executive Audit Trail" },
      ]}
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>Executive Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Headmaster audit stream of result approvals, score submissions, and roll call modifications.
          </p>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Academic Executive Log Events</CardTitle>
              <CardDescription className="text-xs">
                Showing {logs.length} executive governance events.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadLogs} className="h-8 text-xs gap-1">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
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
                    <TableHead>User / Actor</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Target Entity</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-bold text-xs">{log.userName}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-500">{log.userRole}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{log.entity}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-500">{log.timestamp}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {log.details}
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
