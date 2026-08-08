"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const ROLE_MAP: Record<string, string> = {
  administrator: "/admin",
  principal: "/principal",
  teacher: "/teacher",
  student: "/student",
};

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    const targetRoute = ROLE_MAP[role || "administrator"] || "/admin";
    router.replace(targetRoute);
  }, [role, router]);

  return null;
}
