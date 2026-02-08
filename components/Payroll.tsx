
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Employee, ViolationType, Penalty, AttendanceRecord } from '../types';

interface PayrollProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  violationTypes: ViolationType[];
  attendance: AttendanceRecord[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Payroll: React.FC<PayrollProps> = ({ employees, setEmployees, violationTypes, attendance }) => {
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [penaltyModalEmp, setPenaltyModalEmp] = useState<Employee | null>(null);
  const [selectedViolationId, setSelectedViolationId] = useState<string>('');

  // معيار الحساب: الشهر يعتبر 30 يوماً لأغراض الخصم المالي
  const WORKING_DAYS_MONTH = 30; 

  const calculateAbsenceData = (emp: Employee) => {
    const dailyRate = emp.baseSalary / WORKING_DAYS_MONTH;
    const absenceRecords = attendance.filter(a => a.employeeId === emp.id && a.status === 'غائب');
    const count = absenceRecords.length;
    return {
      count,
      amount: count * dailyRate,
      dates: absenceRecords.map(a => a.date)
    };
  };

  const calculateViolationDeduction = (emp: Employee) => {
    return emp.penalties.reduce((sum, p) => sum + p.amountDeducted, 0);
  };

  const calculateFinalPayroll = (emp: Employee) => {
    const absence = calculateAbsenceData(emp);
    const violations = calculateViolationDeduction(emp);
    const totalDeductions = absence.amount + violations;
    const netSalary = emp.baseSalary - totalDeductions;
    
    return {
      base: emp.baseSalary,
      absenceCount: absence.count,
      absenceDeduction: absence.amount,
      violationDeduction: violations,
      totalDeductions,
      netSalary,
      absenceDates: absence.dates
    };
  };

  const handleApplyPenalty = () => {
    if (!penaltyModalEmp || !selectedViolationId) return;
    
    const violation = violationTypes.find(v => v.id === selectedViolationId);
    if (!violation) return;

    // حساب مبلغ الخصم بناءً على النسبة المئوية المحددة في الإعدادات
    const amountToDeduct = (penaltyModalEmp.baseSalary * violation.deductionPercentage) / 100;

    const newPenalty: Penalty = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: penaltyModalEmp.id,
      violationId: violation.id,
      date: new Date().toISOString().split('T')[0],
      amountDeducted: amountToDeduct
    };

    setEmployees(prev => prev.map(e => 
      e.id === penaltyModalEmp.id 
        ? { ...e, penalties: [...e.penalties, newPenalty] } 
        : e
    ));

    setPenaltyModalEmp(null);
    setSelectedViolationId('');
  };

  // إحصائيات عامة
  const totalBaseSalaries = employees.reduce((sum, emp) => sum + emp.baseSalary, 0);
  const totalAbsenceDeductions = employees.reduce((sum, emp) => sum + calculateAbsenceData(emp).amount, 0);
  const totalViolationDeductions = employees.reduce((sum, emp) => sum + calculateViolationDeduction(emp), 0);
  const totalNetSalaries = totalBaseSalaries - (totalAbsenceDeductions + totalViolationDeductions);

  // بيانات الرسم البياني
  const deptSalaryMap = employees.reduce((acc: Record<string, number>, emp: Employee) => {
    const payroll = calculateFinalPayroll(emp);
    acc[emp.department] = (acc[emp.department] || 0) + payroll.netSalary;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(deptSalaryMap).map(([name, value]) => ({
    name,
    total: Math.round(value as number)
  }));

  const handleExportAbsenceReport = () => {
    const headers = ["اسم الموظف", "عدد أيام الغياب", "تواريخ الغياب"];
    const rows = employees.map(emp => {
      const absence = calculateAbsenceData(emp);
      return [
        `"${emp.name}"`,
        absence.count,
        `"${absence.dates.join(' | ') || 'لا يوجد'}"`
      ];
    });

    let csvContent = "\ufeff"; 
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => { csvContent += row.join(",") + "\n"; });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_غياب_الموظفين_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleExportCSV = () => {
    const headers = ["اسم الموظف", "الراتب الأساسي", "أيام الغياب", "خصم الغياب", "خصم المخالفات", "إجمالي الخصومات", "صافي الراتب"];
    const rows = employees.map(emp => {
      const p = calculateFinalPayroll(emp);
      return [
        `"${emp.name}"`,
        p.base.toFixed(2),
        p.absenceCount,
        p.absenceDeduction.toFixed(2),
        p.violationDeduction.toFixed(2),
        p.totalDeductions.toFixed(2),
        p.netSalary.toFixed(2)
      ];
    });

    let csvContent = "\ufeff"; 
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => { csvContent += row.join(",") + "\n"; });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `مسير_الرواتب_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900">كشوف المرتبات والتحليل المالي</h2>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            يتم خصم راتب يوم كامل تلقائياً لكل غياب، والجزاءات تعتمد على النسبة المئوية.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <button 
            onClick={handleExportAbsenceReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-3.5 rounded-2xl transition-all font-bold active:scale-95 border border-indigo-100"
          >
            <span>📅</span> تقرير الغياب (CSV)
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-100 font-bold active:scale-95"
          >
            <span>📥</span> تصدير الرواتب (CSV)
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'إجمالي الرواتب الأساسية', val: totalBaseSalaries, color: 'text-indigo-600', border: 'border-indigo-500', bg: 'bg-indigo-50/30' },
          { label: 'خصومات الغياب', val: totalAbsenceDeductions, color: 'text-rose-600', border: 'border-rose-500', bg: 'bg-rose-50/30' },
          { label: 'خصومات الجزاءات', val: totalViolationDeductions, color: 'text-amber-600', border: 'border-amber-500', bg: 'bg-amber-50/30' },
          { label: 'صافي المبلغ المستحق صرفه', val: totalNetSalaries, color: 'text-emerald-700', border: 'border-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl border-b-4 ${stat.border} ${stat.bg} shadow-sm transition-transform hover:-translate-y-1`}>
            <p className="text-gray-500 text-[11px] font-black uppercase tracking-wider mb-2">{stat.label}</p>
            <h3 className={`text-2xl font-black ${stat.color}`}>
              {Math.round(stat.val).toLocaleString()} <span className="text-xs font-normal opacity-70">ريال</span>
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Section */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-800">قائمة استحقاقات الموظفين</h3>
            <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">عدد الموظفين: {employees.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">الموظف</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">الأساسي</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">الغياب</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">الخصومات</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">الصافي</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((emp) => {
                  const p = calculateFinalPayroll(emp);
                  return (
                    <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                            {emp.name.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-gray-600">{p.base.toLocaleString()}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${p.absenceCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
                          {p.absenceCount} يوم
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-rose-500">
                        -{Math.round(p.totalDeductions).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center font-black text-indigo-700 bg-indigo-50/10">
                        {Math.round(p.netSalary).toLocaleString()} ريال
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setViewingEmployee(emp)}
                            className="text-[10px] font-black text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-all"
                          >
                            كشف
                          </button>
                          <button 
                            onClick={() => setPenaltyModalEmp(emp)}
                            className="text-[10px] font-black text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition-all"
                          >
                            جزاء +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
            توزيع الرواتب الصافية
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', direction: 'rtl'}}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={35}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Penalty Modal */}
      {penaltyModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span className="text-rose-500">⚠️</span> تطبيق جزاء إداري
            </h2>
            <p className="text-sm text-gray-500">الموظف: <b>{penaltyModalEmp.name}</b></p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">اختر نوع المخالفة</label>
                <select 
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  value={selectedViolationId}
                  onChange={(e) => setSelectedViolationId(e.target.value)}
                >
                  <option value="">-- اختر من اللائحة --</option>
                  {violationTypes.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.deductionPercentage}%)</option>
                  ))}
                </select>
                {selectedViolationId && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 italic">
                    سيتم خصم {violationTypes.find(v => v.id === selectedViolationId)?.deductionPercentage}% من الراتب الأساسي.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleApplyPenalty}
                disabled={!selectedViolationId}
                className="flex-1 bg-rose-600 disabled:bg-gray-200 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-100"
              >
                تطبيق الخصم
              </button>
              <button onClick={() => setPenaltyModalEmp(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Paystub Modal */}
      {viewingEmployee && (() => {
        const p = calculateFinalPayroll(viewingEmployee);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b bg-indigo-900 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black">قسيمة الراتب التفصيلية</h2>
                    <p className="opacity-70 font-bold text-sm">{viewingEmployee.name} • {viewingEmployee.position}</p>
                  </div>
                  <button onClick={() => setViewingEmployee(null)} className="text-white/60 hover:text-white text-2xl">✕</button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8 bg-gray-50/30">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                    <span className="text-gray-500 font-bold">الراتب الأساسي</span>
                    <span className="text-indigo-600 font-black">{p.base.toLocaleString()} ريال</span>
                  </div>
                  
                  <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-rose-700 font-bold">خصم الغياب ({p.absenceCount} يوم)</span>
                      <span className="text-rose-600 font-black">-{Math.round(p.absenceDeduction).toLocaleString()} ريال</span>
                    </div>

                    <div className="border-t border-rose-100 pt-3 space-y-2">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-rose-700 font-bold">مخالفات وجزاءات إدارية</span>
                        <span className="text-rose-600 font-black">-{Math.round(p.violationDeduction).toLocaleString()} ريال</span>
                      </div>
                      
                      {viewingEmployee.penalties.length > 0 && (
                        <div className="space-y-1.5 pl-2 border-r-2 border-rose-200 mr-2">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-tighter">سجل المخالفات المسجلة:</p>
                          {viewingEmployee.penalties.map(pen => {
                            const vType = violationTypes.find(v => v.id === pen.violationId);
                            return (
                              <div key={pen.id} className="flex justify-between items-center text-[11px] bg-white/60 p-2 rounded-lg border border-rose-50">
                                <span className="text-gray-600 font-bold">
                                  📅 {pen.date} <span className="mx-1 opacity-30">|</span> {vType?.name || 'مخالفة غير معرفة'}
                                </span>
                                <span className="text-rose-600 font-black">-{Math.round(pen.amountDeducted).toLocaleString()} ر.س</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold opacity-70 uppercase mb-1">صافي الراتب المستحق</p>
                    <h4 className="text-3xl font-black">{Math.round(p.netSalary).toLocaleString()} <span className="text-sm font-normal opacity-80">ريال</span></h4>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              <div className="p-6 bg-white border-t">
                <button onClick={() => setViewingEmployee(null)} className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-bold">إغلاق</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
