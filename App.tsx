
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Employees } from './components/Employees';
import { Attendance } from './components/Attendance';
import { LeaveRequests } from './components/LeaveRequests';
import { Payroll } from './components/Payroll';
import { Settings } from './components/Settings';
import { AIAssistant } from './components/AIAssistant';
import { ViewType, Employee, EmployeeStatus, ViolationType, AttendanceRecord, LeaveRequest, WorkSettings } from './types';

const STORAGE_KEY = 'HR_PRO_DATABASE';

const INITIAL_EMPLOYEES: Employee[] = [
  { 
    id: '1', 
    name: 'محمد أحمد', 
    position: 'مبرمج أول', 
    department: 'التطوير', 
    email: 'm.ahmed@example.com', 
    phone: '0501234567',
    nationality: 'سعودي',
    gender: 'ذكر',
    maritalStatus: 'متزوج',
    status: EmployeeStatus.Active, 
    joinDate: '2022-01-15', 
    baseSalary: 15000,
    penalties: []
  }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', employeeId: '1', employeeName: 'محمد أحمد', date: '2024-05-20', checkIn: '08:00 ص', checkOut: '04:00 م', status: 'حاضر' }
];

const INITIAL_LEAVES: LeaveRequest[] = [
  { id: '1', employeeId: '1', employeeName: 'محمد أحمد', type: 'إجازة سنوية', duration: '5 أيام', from: '2024-06-01', to: '2024-06-05', status: 'Pending' }
];

const App: React.FC = () => {
  // Database State Management
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([
    { id: '1', name: 'تأخير صباحي', deductionPercentage: 5 }
  ]);
  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    startTime: '08:00',
    endTime: '16:00'
  });

  // Load Database on Startup
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setEmployees(parsed.employees || INITIAL_EMPLOYEES);
        setAttendance(parsed.attendance || INITIAL_ATTENDANCE);
        setLeaves(parsed.leaves || INITIAL_LEAVES);
        setViolationTypes(parsed.violationTypes || []);
        setWorkSettings(parsed.workSettings || {});
      } catch (e) {
        console.error("Failed to parse database", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save Database on Changes
  useEffect(() => {
    if (isLoaded) {
      const db = {
        employees,
        attendance,
        leaves,
        violationTypes,
        workSettings
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  }, [employees, attendance, leaves, violationTypes, workSettings, isLoaded]);

  const handleResetDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard employees={employees} />;
      case 'employees': return <Employees employees={employees} setEmployees={setEmployees} />;
      case 'attendance': return <Attendance attendance={attendance} setAttendance={setAttendance} employees={employees} />;
      case 'leaves': return <LeaveRequests leaves={leaves} setLeaves={setLeaves} />;
      case 'payroll': return <Payroll employees={employees} setEmployees={setEmployees} violationTypes={violationTypes} attendance={attendance} />;
      case 'settings': return (
        <Settings 
          violationTypes={violationTypes} 
          setViolationTypes={setViolationTypes} 
          workSettings={workSettings} 
          setWorkSettings={setWorkSettings} 
          onResetDatabase={handleResetDatabase}
        />
      );
      case 'ai-assistant': return <AIAssistant />;
      default: return <Dashboard employees={employees} />;
    }
  };

  if (!isLoaded) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-900 font-bold animate-pulse">جاري تحميل قاعدة بيانات HR Pro...</p>
      </div>
    </div>
  );

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
