
import React, { useState, useRef, useEffect } from 'react';
import { Employee, EmployeeStatus } from '../types';

interface EmployeesProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export const Employees: React.FC<EmployeesProps> = ({ employees, setEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '', position: '', department: '', email: '', phone: '',
    nationality: '', gender: 'ذكر', maritalStatus: 'أعزب',
    baseSalary: 0, joinDate: new Date().toISOString().split('T')[0]
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert('تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الأذونات اللازمة.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: EmployeeStatus.Active,
      penalties: [],
      image: capturedImage || undefined
    } as Employee;
    
    setEmployees([...employees, newEmployee]);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    stopCamera();
    setCapturedImage(null);
    setFormData({
      name: '', position: '', department: '', email: '', phone: '',
      nationality: '', gender: 'ذكر', maritalStatus: 'أعزب',
      baseSalary: 0, joinDate: new Date().toISOString().split('T')[0]
    });
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
      setEmployeeToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <input 
            placeholder="ابحث عن موظف بالاسم أو المنصب..." 
            className="p-3 pr-11 border rounded-xl w-full outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right bg-white shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-3.5 text-gray-400">🔍</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2"
        >
          <span>➕</span>
          إضافة موظف جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">الموظف</th>
                <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">القسم والمنصب</th>
                <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">الجنسية</th>
                <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider">الحالة</th>
                <th className="p-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.filter(e => 
                e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                e.position.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={emp.image || `https://picsum.photos/seed/${emp.id}/50/50`} 
                          className="rounded-2xl w-12 h-12 border-2 border-white shadow-sm object-cover" 
                          alt={emp.name} 
                        />
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${emp.status === EmployeeStatus.Active ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-bold text-gray-700">{emp.department}</p>
                    <p className="text-xs text-gray-400">{emp.position}</p>
                  </td>
                  <td className="p-5 text-sm text-gray-600 font-medium">{emp.nationality}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      emp.status === EmployeeStatus.Active ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEmployeeToDelete(emp)} 
                        className="text-rose-500 hover:text-white p-2.5 rounded-xl hover:bg-rose-500 transition-all shadow-sm hover:shadow-rose-200"
                        title="حذف الموظف من النظام"
                      >
                        <span className="text-xl">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal with Camera Support */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh]">
            
            {/* Left Side: Photo Capture */}
            <div className="md:w-1/3 bg-gray-50 p-8 flex flex-col items-center justify-center border-l border-gray-100">
              <h3 className="text-lg font-black text-gray-800 mb-6">صورة الموظف</h3>
              
              <div className="relative w-48 h-48 bg-gray-200 rounded-[2.5rem] overflow-hidden shadow-inner flex items-center justify-center border-4 border-white mb-6">
                {isCameraActive ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : capturedImage ? (
                  <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                ) : (
                  <div className="text-gray-400 text-5xl">👤</div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex flex-col w-full gap-3">
                {!isCameraActive ? (
                  <button 
                    type="button"
                    onClick={startCamera}
                    className="w-full bg-indigo-50 text-indigo-600 py-3 rounded-2xl font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2"
                  >
                    📸 {capturedImage ? 'تغيير الصورة' : 'فتح الكاميرا'}
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={capturePhoto}
                    className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                  >
                    🎯 التقاط الصورة
                  </button>
                )}
                {isCameraActive && (
                  <button 
                    type="button"
                    onClick={stopCamera}
                    className="w-full bg-rose-50 text-rose-600 py-3 rounded-2xl font-bold hover:bg-rose-100 transition"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: Form Details */}
            <div className="flex-1 flex flex-col">
              <div className="p-8 bg-indigo-600 text-white flex justify-between items-center relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <div className="relative z-10">
                  <h2 className="text-2xl font-black">بيانات الموظف الأساسية</h2>
                  <p className="text-indigo-100 text-sm opacity-90">أدخل المعلومات المطلوبة بدقة</p>
                </div>
                <button onClick={closeModal} className="text-white/70 hover:text-white text-3xl">✕</button>
              </div>
              
              <form onSubmit={handleAddEmployee} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">الاسم الكامل</label>
                  <input required placeholder="أدخل الاسم الرباعي" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium" onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">المنصب الوظيفي</label>
                  <input required placeholder="المسمى الوظيفي" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium" onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">القسم</label>
                  <input required placeholder="مثل: التطوير" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium" onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">البريد الإلكتروني</label>
                  <input required type="email" placeholder="example@hr-pro.com" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium" onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">رقم الجوال</label>
                  <input required placeholder="05xxxxxxxx" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">الراتب الأساسي</label>
                  <input required type="number" placeholder="المبلغ بالريال" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium" onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">تاريخ المباشرة</label>
                  <input required type="date" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 px-1 uppercase tracking-widest">الجنسية</label>
                  <input required placeholder="مثل: سعودي" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-medium" onChange={e => setFormData({...formData, nationality: e.target.value})} />
                </div>
              </form>
              
              <div className="p-8 bg-gray-50 border-t flex gap-4">
                <button onClick={closeModal} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition">إلغاء</button>
                <button type="submit" onClick={handleAddEmployee} className="flex-2 bg-indigo-600 text-white py-3.5 px-12 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95">
                  حفظ البيانات والملف الشخصي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">⚠️</div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">تأكيد الحذف</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">أنت على وشك حذف الموظف <span className="font-bold text-rose-600">({employeeToDelete.name})</span>. سيتم مسح كافة سجلاته بشكل نهائي.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={confirmDelete} className="bg-rose-600 text-white py-4 rounded-2xl font-black hover:bg-rose-700 transition shadow-lg shadow-rose-100">نعم، حذف</button>
              <button onClick={() => setEmployeeToDelete(null)} className="bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">تراجع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
