/**
 * Supabase Database TypeScript Definitions
 * Mirrors the PostgreSQL normalized schema for the School Management System.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleEnum = "administrator" | "principal" | "teacher" | "student";
export type AttendanceStatusEnum = "present" | "absent" | "late" | "excused";
export type AnnouncementTargetEnum = "all" | "teachers" | "students" | "parents";

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      school_settings: {
        Row: {
          id: string;
          school_id: string;
          timezone: string;
          grade_scale: Json;
          current_academic_year_id: string | null;
          current_term_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          school_id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: UserRoleEnum;
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      students: {
        Row: {
          id: string;
          profile_id: string;
          school_id: string;
          student_code: string;
          date_of_birth: string | null;
          gender: string | null;
          guardian_name: string | null;
          guardian_contact: string | null;
          enrollment_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          profile_id: string;
          school_id: string;
          employee_code: string;
          department: string | null;
          qualification: string | null;
          joining_date: string;
          created_at: string;
          updated_at: string;
        };
      };
      academic_years: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      terms: {
        Row: {
          id: string;
          school_id: string;
          academic_year_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      classes: {
        Row: {
          id: string;
          school_id: string;
          academic_year_id: string;
          name: string;
          grade_level: string;
          section: string | null;
          class_teacher_id: string | null;
          capacity: number;
          created_at: string;
          updated_at: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          school_id: string;
          code: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      teacher_assignments: {
        Row: {
          id: string;
          school_id: string;
          teacher_id: string;
          subject_id: string;
          class_id: string;
          term_id: string;
          created_at: string;
          updated_at: string;
        };
      };
      student_enrollments: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          class_id: string;
          academic_year_id: string;
          roll_number: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      results: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          subject_id: string;
          class_id: string;
          term_id: string;
          assessment_name: string;
          score: number;
          max_score: number;
          grade: string | null;
          remarks: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          class_id: string;
          date: string;
          status: AttendanceStatusEnum;
          remarks: string | null;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      timetables: {
        Row: {
          id: string;
          school_id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          term_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          room_number: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          school_id: string;
          author_id: string;
          title: string;
          content: string;
          target_audience: AnnouncementTargetEnum;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          school_id: string;
          user_id: string;
          title: string;
          message: string;
          is_read: boolean;
          link_url: string | null;
          created_at: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          school_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          ip_address: string | null;
          created_at: string;
        };
      };
    };
  };
}
