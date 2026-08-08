import { NavSection, UserRole, UserProfile } from "@/types";

export const ROLE_LABELS: Record<UserRole, { title: string; badge: string; color: string }> = {
  administrator: {
    title: "System Administrator",
    badge: "Admin",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  principal: {
    title: "Headmaster / Principal",
    badge: "Headmaster",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  teacher: {
    title: "Subject Teacher",
    badge: "Teacher",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  student: {
    title: "Enrolled Student",
    badge: "Student",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
};

export const MOCK_PROFILES: Record<UserRole, UserProfile> = {
  administrator: {
    id: "usr_admin_01",
    name: "Kofi Owusu-Ansah",
    email: "admin@ghanaschools.edu.gh",
    role: "administrator",
    phone: "+233 24 412 3456",
    department: "IT & System Operations",
    employeeId: "GES-ADM-2026-01",
  },
  principal: {
    id: "usr_principal_01",
    name: "Rev. Emmanuel Mensah",
    email: "headmaster@ghanaschools.edu.gh",
    role: "principal",
    phone: "+233 20 812 9988",
    department: "Headmaster Office",
    employeeId: "GES-HM-2026-01",
  },
  teacher: {
    id: "usr_teacher_01",
    name: "Abena Appiah",
    email: "a.appiah@ghanaschools.edu.gh",
    role: "teacher",
    phone: "+233 55 987 6543",
    department: "J.H.S",
    employeeId: "GES-TCH-2026-44",
  },
  student: {
    id: "usr_student_01",
    name: "Kwame Kyeremateng",
    email: "k.kyeremateng@student.ghanaschools.edu.gh",
    role: "student",
    phone: "+233 24 555 0192",
    gradeLevel: "Basic 8 - Section A",
    studentId: "GES-STU-2026-889",
  },
};

export const NAVIGATION_BY_ROLE: Record<UserRole, NavSection[]> = {
  administrator: [
    {
      title: "Core",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: "LayoutDashboard",
          roles: ["administrator"],
        },
        {
          title: "Students",
          href: "/admin/students",
          icon: "GraduationCap",
          badge: "GES",
          roles: ["administrator"],
        },
        {
          title: "Teachers",
          href: "/admin/teachers",
          icon: "UserCheck",
          badge: "Faculty",
          roles: ["administrator"],
        },
        {
          title: "System Logs",
          href: "#",
          icon: "ShieldAlert",
          roles: ["administrator"],
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "School Timetable",
          href: "/admin/timetable",
          icon: "Calendar",
          badge: "Master",
          roles: ["administrator"],
        },
        {
          title: "School Structure",
          href: "#",
          icon: "Building2",
          roles: ["administrator"],
        },
        {
          title: "System Settings",
          href: "#",
          icon: "Settings",
          roles: ["administrator"],
        },
      ],
    },
  ],
  principal: [
    {
      title: "Core",
      items: [
        {
          title: "Dashboard",
          href: "/principal",
          icon: "LayoutDashboard",
          roles: ["principal"],
        },
        {
          title: "Result Approvals",
          href: "/principal/approvals",
          icon: "FileCheck",
          badge: "Queue",
          roles: ["principal"],
        },
        {
          title: "Academic Overview",
          href: "#",
          icon: "GraduationCap",
          roles: ["principal"],
        },
        {
          title: "Faculty & Staff",
          href: "#",
          icon: "UserCheck",
          roles: ["principal"],
        },
      ],
    },
    {
      title: "Reports & Governance",
      items: [
        {
          title: "Attendance Analytics",
          href: "/principal/attendance",
          icon: "BarChart3",
          roles: ["principal"],
        },
        {
          title: "Master Timetable",
          href: "/principal/timetable",
          icon: "Calendar",
          roles: ["principal"],
        },
        {
          title: "Announcements",
          href: "/principal/announcements",
          icon: "Bell",
          badge: "Notice",
          roles: ["principal"],
        },
      ],
    },
  ],
  teacher: [
    {
      title: "Core",
      items: [
        {
          title: "Dashboard",
          href: "/teacher",
          icon: "LayoutDashboard",
          roles: ["teacher"],
        },
        {
          title: "My Students",
          href: "/teacher/students",
          icon: "GraduationCap",
          badge: "Roster",
          roles: ["teacher"],
        },
        {
          title: "My Classes",
          href: "#",
          icon: "BookOpen",
          roles: ["teacher"],
        },
        {
          title: "Attendance",
          href: "/teacher/attendance",
          icon: "CalendarCheck",
          badge: "Register",
          roles: ["teacher"],
        },
      ],
    },
    {
      title: "Academic",
      items: [
        {
          title: "Gradebook & Results",
          href: "/teacher/results",
          icon: "Award",
          badge: "GES",
          roles: ["teacher"],
        },
        {
          title: "Schedule",
          href: "/teacher/timetable",
          icon: "Clock",
          roles: ["teacher"],
        },
      ],
    },
  ],
  student: [
    {
      title: "Core",
      items: [
        {
          title: "Dashboard",
          href: "/student",
          icon: "LayoutDashboard",
          roles: ["student"],
        },
        {
          title: "Results",
          href: "/student/results",
          icon: "Award",
          roles: ["student"],
        },
        {
          title: "Attendance",
          href: "/student/attendance",
          icon: "CalendarCheck",
          roles: ["student"],
        },
        {
          title: "Teachers",
          href: "/student/teachers",
          icon: "UserCheck",
          roles: ["student"],
        },
      ],
    },
    {
      title: "Academic & Campus",
      items: [
        {
          title: "Timetable",
          href: "/student/timetable",
          icon: "Calendar",
          roles: ["student"],
        },
        {
          title: "Announcements",
          href: "/student/announcements",
          icon: "Megaphone",
          roles: ["student"],
        },
        {
          title: "Profile",
          href: "/student/profile",
          icon: "User",
          roles: ["student"],
        },
      ],
    },
  ],
};
