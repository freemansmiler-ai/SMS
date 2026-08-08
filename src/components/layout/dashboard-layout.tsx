import React from "react";
import { DashboardShell, DashboardShellProps } from "@/components/layout/dashboard-shell";

export const DashboardLayout: React.FC<DashboardShellProps> = (props) => {
  return <DashboardShell {...props} />;
};
