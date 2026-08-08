export type UserRole = "administrator" | "principal" | "teacher" | "student";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  gradeLevel?: string;
  studentId?: string;
  employeeId?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  roles: UserRole[];
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  description?: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  category: "academic" | "administrative" | "system" | "event";
  user: string;
}
