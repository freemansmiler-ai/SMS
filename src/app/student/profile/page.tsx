"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Phone, ShieldCheck, Mail } from "lucide-react";

export default function StudentProfilePage() {
  return (
    <DashboardShell
      role="student"
      breadcrumbs={[
        { label: "Student Dashboard", href: "/student" },
        { label: "My Profile" },
      ]}
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <span>My Student Profile</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal enrollment record and emergency contact details.
          </p>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-700">
                <AvatarFallback className="text-xl font-bold bg-slate-900 text-white">
                  KK
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    Kwame Kyeremateng
                  </h2>
                  <Badge variant="success" className="text-[10px]">
                    Active Student
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>Student ID: GES-STU-2026-889</span>
                  <span>•</span>
                  <span>Basic 8 - Section A</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>Guardian & Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Guardian Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Kofi Kyeremateng</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Guardian Phone:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">+233 24 412 3456</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">k.kyeremateng@student.ghanaschools.edu.gh</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                <span>Security & Authorization Scope</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs space-y-2">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Profile edits or status modifications must be performed by contacting the School Administration office.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
