
export enum EmployeeStatus {
  Active = 'نشط',
  OnLeave = 'في إجازة',
  Terminated = 'مستقيل'
}

export interface ViolationType {
  id: string;
  name: string;
  deductionPercentage: number;
}

export interface Penalty {
  id: string;
  employeeId: string;
  violationId: string;
  date: string;
  amountDeducted: number;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  nationality: string;
  gender: 'ذكر' | 'أنثى';
  maritalStatus: 'أعزب' | 'متزوج';
  status: EmployeeStatus;
  joinDate: string;
  baseSalary: number;
  penalties: Penalty[];
  image?: string; // صورة الملف الشخصي (Base64)
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'حاضر' | 'غائب' | 'متأخر';
  notes?: string; // ملاحظات حول التأخير أو المغادرة المبكرة
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  duration: string;
  from: string;
  to: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface WorkSettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
}

export type ViewType = 'dashboard' | 'employees' | 'attendance' | 'leaves' | 'payroll' | 'settings' | 'ai-assistant';
