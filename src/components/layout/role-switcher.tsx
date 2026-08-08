"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/role-context";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/constants/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ChevronDown, Check } from "lucide-react";

const ROLE_ROUTES: Record<UserRole, string> = {
  administrator: "/admin",
  principal: "/principal",
  teacher: "/teacher",
  student: "/student",
};

export const RoleSwitcher: React.FC = () => {
  const { activeRole, setRole } = useRole();
  const router = useRouter();

  const roles: UserRole[] = ["administrator", "principal", "teacher", "student"];

  const handleRoleSwitch = (role: UserRole) => {
    setRole(role);
    router.push(ROLE_ROUTES[role]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 bg-background border-slate-200 dark:border-slate-800 text-xs font-normal"
        >
          <Shield className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline-block font-medium">Role:</span>
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-semibold">
            {ROLE_LABELS[activeRole].badge}
          </Badge>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          Switch System Role View
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className="flex items-center justify-between py-2 text-xs cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {ROLE_LABELS[role].title}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                Go to {role} dashboard
              </span>
            </div>
            {activeRole === role && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
