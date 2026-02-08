
import React, { useState } from 'react';
import { AttendanceRecord, Employee } from '../types';

interface AttendanceProps {
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  employees: Employee[];
}

export const Attendance: React.FC<AttendanceProps> = ({ attendance, setAttendance, employees }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [newEntry, setNewEntry] = useState({ 
    empId: '', 
    status: 'حاضر' as any,
    checkIn: '08:00',
    checkOut: '16:00',
    notes: ''
  });

  const formatTimeToArabic = (timeStr: string) => {
    if (!timeStr) return '--:--';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'م' : 'ص';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleManualEntry = () => {
    const emp = employees.find(e => e.id === newEntry.empId);
    if (!emp) return;

    const record: AttendanceRecord = {
      id: Math.random().toString(),
      employeeId: emp.id,
      employeeName: emp.name,
      date: new Date().toISOString().split('T')[0],
      checkIn: formatTimeToArabic(newEntry.checkIn),
      checkOut: formatTimeToArabic(newEntry.checkOut),
      status: newEntry.status,
      notes: newEntry.notes.trim() || undefined
    };
    setAttendance([record, ...attendance]);
    setIsModalOpen(false);
    // Reset state
    setNewEntry({ empId: '', status: 'حاضر', checkIn: '08:00', checkOut: '16:00', notes: '' });
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    
    // Simulate a small delay for better UX feedback
    setTimeout(() => {
      const headers = ["اسم الموظف", "التاريخ", "وقت الدخول", "وقت الخروج", "الحالة", "ملاحظات"];
      
      // Helper to escape CSV values
      const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

      const rows = attendance.map(record => [
        escapeCSV(record.employeeName),
        escapeCSV(record.date),
        escapeCSV(record.checkIn),
        escapeCSV(record.checkOut),
        escapeCSV(record.status),
        escapeCSV(record.notes || '')
      ]);

      let csvContent = "\ufeff"; // UTF-8 BOM for Excel Arabic support
      csvContent += headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `سجل_الحضور_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900">سجل الحضور والانصراف</h3>
            <p className="text-sm text-gray-500">متابعة الحضور اليومي للموظفين وإدارة السجلات</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleExportCSV}
              disabled={isExporting || attendance.length === 0}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold active:scale-95 shadow-lg ${
                isExporting 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
              }`}
            >
              <span className={isExporting ? 'animate-bounce' : ''}>
                {isExporting ? '⏳' : '📥'}
              </span>
              {isExporting ? 'جاري التصدير...' : 'تصدير (CSV)'}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-100 font-bold active:scale-95"
            >
              <span>➕</span>
              تسجيل يدوي
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-gray-50">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-bold text-gray-400">الموظف</th>
                <th className="p-4 text-sm font-bold text-gray-400">التاريخ</th>
                <th className="p-4 text-sm font-bold text-gray-400">وقت الدخول</th>
                <th className="p-4 text-sm font-bold text-gray-400">وقت الانصراف</th>
                <th className="p-4 text-sm font-bold text-gray-400">الملاحظات</th>
                <th className="p-4 text-sm font-bold text-gray-400 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs">👤</div>
                      {record.employeeName}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm font-medium">{record.date}</td>
                  <td className="p-4 text-gray-600 text-sm font-bold">{record.checkIn}</td>
                  <td className="p-4 text-gray-600 text-sm font-bold">{record.checkOut}</td>
                  <td className="p-4 text-gray-500 text-xs max-w-xs truncate" title={record.notes}>
                    {record.notes || '-'}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'حاضر' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : record.status === 'متأخر'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current ml-1.5"></span>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="text-4xl mb-4 opacity-20">📅</div>
                    <p className="text-gray-400 font-medium">لا توجد سجلات حضور مسجلة حتى الآن</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-indigo-600">📝</span>
              تسجيل حضور يدوي
            </h2>
            
            <div className="space-y-5 mb-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">اختر الموظف</label>
                <select 
                  className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right font-bold" 
                  onChange={e => setNewEntry({...newEntry, empId: e.target.value})}
                  value={newEntry.empId}
                >
                  <option value="">-- اختر الموظف --</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">وقت الحضور الفعلي</label>
                  <input 
                    type="time"
                    className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right font-bold"
                    value={newEntry.checkIn}
                    onChange={e => setNewEntry({...newEntry, checkIn: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">وقت الانصراف الفعلي</label>
                  <input 
                    type="time"
                    className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right font-bold"
                    value={newEntry.checkOut}
                    onChange={e => setNewEntry({...newEntry, checkOut: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">الحالة</label>
                <select 
                  className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right font-bold" 
                  onChange={e => setNewEntry({...newEntry, status: e.target.value as any})}
                  value={newEntry.status}
                >
                  <option value="حاضر">حاضر ✅</option>
                  <option value="متأخر">متأخر ⏳</option>
                  <option value="غائب">غائب ❌</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">ملاحظات (اختياري)</label>
                <textarea 
                  placeholder="أدخل أي ملاحظات حول التأخير أو المغادرة المبكرة..."
                  className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right font-medium min-h-[80px] resize-none"
                  value={newEntry.notes}
                  onChange={e => setNewEntry({...newEntry, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleManualEntry} 
                disabled={!newEntry.empId}
                className="flex-1 bg-indigo-600 disabled:bg-gray-200 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95"
              >
                تأكيد وحفظ السجل
              </button>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-bold hover:bg-gray-200 transition"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
