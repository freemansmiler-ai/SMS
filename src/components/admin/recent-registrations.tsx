"use client";

import React from "react";
import { RecentUserRegistration } from "@/lib/services/admin-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface RecentRegistrationsProps {
  registrations: RecentUserRegistration[];
  loading: boolean;
}

export const RecentRegistrations: React.FC<RecentRegistrationsProps> = ({
  registrations,
  loading,
}) => {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm font-semibold">Recent Registrations</CardTitle>
        <CardDescription className="text-xs">
          Latest user profiles registered in the school database.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Recent Registrations"
              description="No new user accounts have been created recently."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {user.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{user.email}</TableCell>
                  <TableCell className="text-right text-xs text-slate-400">
                    {user.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
