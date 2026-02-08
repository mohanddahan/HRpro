
import React, { useState } from 'react';
import { ViolationType, WorkSettings } from '../types';

interface SettingsProps {
  violationTypes: ViolationType[];
  setViolationTypes: React.Dispatch<React.SetStateAction<ViolationType[]>>;
  workSettings: WorkSettings;
  setWorkSettings: React.Dispatch<React.SetStateAction<WorkSettings>>;
  onResetDatabase: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  violationTypes, 
  setViolationTypes, 
  workSettings, 
  setWorkSettings,
  onResetDatabase
}) => {
  const [newName, setNewName] = useState('');
  const [newPercent, setNewPercent] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const DAYS_OF_WEEK = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const addViolation = () => {
    if (!newName) return;
    const newEntry: ViolationType = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      deductionPercentage: newPercent
    };
    setViolationTypes([...violationTypes, newEntry]);
    setNewName('');
    setNewPercent(0);
  };

  const deleteViolation = (id: string) => {
    setViolationTypes(violationTypes.filter(v => v.id !== id));
  };

  const toggleDay = (day: string) => {
    const isSelected = workSettings.workingDays.includes(day);
    if (isSelected) {
      setWorkSettings({
        ...workSettings,
        workingDays: workSettings.workingDays.filter(d => d !== day)
      });
    } else {
      setWorkSettings({
        ...workSettings,
        workingDays: [...workSettings.workingDays, day]
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12 animate-in fade-in duration-500">
      {/* Work Schedule Settings Section */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-sm">⏰</div>
          <div>
            <h3 className="text-xl font-black text-gray-800">إعدادات الدوام الرسمي</h3>
            <p className="text-sm text-gray-400">تحديد ساعات العمل وأيام المباشرة الأسبوعية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">ساعات العمل</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 pr-1">وقت الحضور</label>
                <input 
                  type="time" 
                  className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  value={workSettings.startTime}
                  onChange={(e) => setWorkSettings({...workSettings, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 pr-1">وقت الانصراف</label>
                <input 
                  type="time" 
                  className="w-full p-3.5 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  value={workSettings.endTime}
                  onChange={(e) => setWorkSettings({...workSettings, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">أيام العمل</h4>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = workSettings.workingDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Violation Types Management */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-2xl shadow-sm">🚨</div>
          <div>
            <h3 className="text-xl font-black text-gray-800">لائحة المخالفات والخصومات</h3>
            <p className="text-sm text-gray-400">إدارة أنواع التجاوزات ونسب الخصم المترتبة عليها</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <input
            type="text"
            placeholder="اسم المخالفة الجديد..."
            className="flex-1 border-0 bg-white rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 text-right font-bold shadow-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex items-center gap-2 bg-white px-4 rounded-xl shadow-sm">
            <input
              type="number"
              placeholder="0"
              className="w-16 border-0 text-center py-3 outline-none font-black text-rose-600"
              value={newPercent || ''}
              onChange={(e) => setNewPercent(Number(e.target.value))}
            />
            <span className="text-gray-400 font-bold">%</span>
          </div>
          <button 
            onClick={addViolation}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-black active:scale-95"
          >
            إضافة للائحة
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">اسم المخالفة</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">نسبة الخصم</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {violationTypes.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-bold">{v.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg font-black text-sm">{v.deductionPercentage}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => deleteViolation(v.id)} 
                      className="text-rose-400 hover:text-rose-600 p-2 rounded-xl transition-all"
                    >
                      🗑️ حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Database Management Section */}
      <section className="bg-rose-50 p-8 rounded-3xl border border-rose-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white text-rose-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">💾</div>
            <div>
              <h3 className="text-xl font-black text-rose-900">إدارة قاعدة البيانات</h3>
              <p className="text-sm text-rose-700 font-medium">بياناتك محفوظة محلياً؛ يمكنك مسح كافة السجلات للبدء من جديد.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-rose-700 transition shadow-xl shadow-rose-200 active:scale-95 whitespace-nowrap"
          >
            تصفير النظام بالكامل
          </button>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">⚠️</div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">هل أنت متأكد تماماً؟</h3>
            <p className="text-gray-500 mb-10 leading-relaxed font-medium">
              سيتم حذف جميع <span className="text-rose-600 font-bold">الموظفين، السجلات، والبيانات المالية</span> نهائياً. لا يمكن التراجع عن هذا الإجراء!
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onResetDatabase} 
                className="bg-rose-600 text-white py-4 rounded-2xl font-black hover:bg-rose-700 transition shadow-xl shadow-rose-100"
              >
                نعم، احذف كل شيء
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)} 
                className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
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
