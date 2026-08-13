/**
 * Shared school structure constants.
 *
 * Single source of truth for grade levels and departments.
 * Import from here in all components, services, and pages.
 */

export const DEPARTMENTS = [
  { id: "early-grade",    label: "Early Grade Department" },
  { id: "lower-primary",  label: "Lower Primary Department" },
  { id: "upper-primary",  label: "Upper Primary Department" },
  { id: "jhs",            label: "J.H.S Department" },
] as const;

export type DepartmentId = (typeof DEPARTMENTS)[number]["id"];

/**
 * All 13 grade levels, mapped to their department.
 */
export const GRADE_LEVELS = [
  { value: "Nursery 1", label: "Nursery 1", department: "early-grade"   },
  { value: "Nursery 2", label: "Nursery 2", department: "early-grade"   },
  { value: "K.G 1",     label: "K.G 1",     department: "early-grade"   },
  { value: "K.G 2",     label: "K.G 2",     department: "early-grade"   },
  { value: "Basic 1",   label: "Basic 1",   department: "lower-primary" },
  { value: "Basic 2",   label: "Basic 2",   department: "lower-primary" },
  { value: "Basic 3",   label: "Basic 3",   department: "lower-primary" },
  { value: "Basic 4",   label: "Basic 4",   department: "upper-primary" },
  { value: "Basic 5",   label: "Basic 5",   department: "upper-primary" },
  { value: "Basic 6",   label: "Basic 6",   department: "upper-primary" },
  { value: "Basic 7",   label: "Basic 7",   department: "jhs"           },
  { value: "Basic 8",   label: "Basic 8",   department: "jhs"           },
  { value: "Basic 9",   label: "Basic 9",   department: "jhs"           },
] as const;

export type GradeLevelValue = (typeof GRADE_LEVELS)[number]["value"];

/** Returns the department label for a given grade level value. */
export function getDepartmentForGrade(gradeLevel: string): string {
  const match = GRADE_LEVELS.find((g) => g.value === gradeLevel);
  if (!match) return "J.H.S Department";
  const dept = DEPARTMENTS.find((d) => d.id === match.department);
  return dept?.label ?? "J.H.S Department";
}

/** Returns just the grade level values as a plain string array. */
export const GRADE_LEVEL_VALUES = GRADE_LEVELS.map((g) => g.value);
