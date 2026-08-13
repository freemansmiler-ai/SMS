/**
 * CSV Template utility for bulk student upload
 */

export interface CSVStudentRow {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  guardianName?: string;
  guardianContact?: string;
  classId?: string;
  gradeLevel?: string;
}

/**
 * Generate CSV template for bulk student upload
 */
export function generateStudentCSVTemplate(): string {
  const headers = [
    'firstName',
    'lastName', 
    'email',
    'dateOfBirth',
    'gender',
    'guardianName',
    'guardianContact',
    'classId',
    'gradeLevel'
  ];

  const sampleRows = [
    [
      'John',
      'Doe',
      'john.doe@student.example.com',
      '2010-05-15',
      'Male',
      'Jane Doe',
      '+233 24 123 4567',
      'class-basic7a',
      'Basic 7'
    ],
    [
      'Sarah',
      'Smith',
      'sarah.smith@student.example.com',
      '2009-12-08',
      'Female',
      'Michael Smith',
      '+233 20 987 6543',
      'class-basic8a',
      'Basic 8'
    ]
  ];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV template file
 */
export function downloadCSVTemplate(): void {
  const csvContent = generateStudentCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Parse CSV content and convert to student records
 */
export function parseCSVToStudents(csvContent: string): CSVStudentRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const expectedHeaders = [
    'firstName', 'lastName', 'email', 'dateOfBirth', 
    'gender', 'guardianName', 'guardianContact', 'classId', 'gradeLevel'
  ];

  // Validate headers
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const students: CSVStudentRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
    }

    const student: any = {};
    headers.forEach((header, index) => {
      student[header] = values[index] || undefined;
    });

    // Validate required fields
    if (!student.firstName || !student.lastName || !student.email) {
      throw new Error(`Row ${i + 1}: firstName, lastName, and email are required`);
    }

    students.push(student);
  }

  return students;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate student code (similar to existing logic)
 */
export function generateStudentCode(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `GES-${year}-${randomSuffix}`;
}