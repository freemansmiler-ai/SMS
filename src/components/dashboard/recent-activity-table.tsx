"use client";

import React, { useState } from "react";
import { useRole } from "@/context/role-context";
import { ActivityItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Eye, FileText, CheckCircle2, RefreshCw } from "lucide-react";

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    title: "Fall Academic Schedule Published",
    timestamp: "10 mins ago",
    category: "academic",
    user: "Academic Office",
  },
  {
    id: "act-2",
    title: "Faculty Security Audit Completed",
    timestamp: "1 hour ago",
    category: "system",
    user: "Dr. Eleanor Vance",
  },
  {
    id: "act-3",
    title: "Gradebook Sync Verification",
    timestamp: "3 hours ago",
    category: "administrative",
    user: "Sarah Jenkins",
  },
  {
    id: "act-4",
    title: "New Student Orientation Announcement",
    timestamp: "Yesterday",
    category: "event",
    user: "Arthur Pendelton",
  },
];

export const RecentActivityTable: React.FC = () => {
  const { activeRole } = useRole();
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty">("normal");

  const getCategoryBadge = (category: ActivityItem["category"]) => {
    switch (category) {
      case "academic":
        return <Badge variant="secondary">Academic</Badge>;
      case "administrative":
        return <Badge variant="outline">Admin</Badge>;
      case "system":
        return <Badge variant="default">System</Badge>;
      case "event":
        return <Badge variant="success">Event</Badge>;
    }
  };

  return (
    <>
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">System Audit & Activity Stream</CardTitle>
            <CardDescription className="text-xs">
              Audit log stream filtered for role:{" "}
              <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{activeRole}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <Button
                variant={viewState === "normal" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => setViewState("normal")}
              >
                Data View
              </Button>
              <Button
                variant={viewState === "loading" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => setViewState("loading")}
              >
                Loading
              </Button>
              <Button
                variant={viewState === "empty" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => setViewState("empty")}
              >
                Zero State
              </Button>
            </div>

            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewState === "loading" && (
            <div className="p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}

          {viewState === "empty" && (
            <div className="p-6">
              <EmptyState
                title="No Audit Records Found"
                description="There are currently no security or academic activity logs registered for this filter selection."
                actionLabel="Refresh Audit Stream"
                onAction={() => setViewState("normal")}
              />
            </div>
          )}

          {viewState === "normal" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Activity Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Initiator</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INITIAL_ACTIVITIES.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {activity.title}
                    </TableCell>
                    <TableCell>{getCategoryBadge(activity.category)}</TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      {activity.user}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{activity.timestamp}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-[11px]">Audit Options</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="text-xs gap-2 cursor-pointer"
                            onClick={() => setSelectedActivity(activity)}
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                            <span>Inspect Record</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Activity Details Dialog */}
      <Dialog open={Boolean(selectedActivity)} onOpenChange={() => setSelectedActivity(null)}>
        {selectedActivity && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                {selectedActivity.title}
              </DialogTitle>
              <DialogDescription className="text-xs pt-1">
                Event audit record registered in school management logs.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Initiator:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedActivity.user}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Recorded:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedActivity.timestamp}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Category:</span>
                <div>{getCategoryBadge(selectedActivity.category)}</div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};
