
import React, { useState } from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'employees', label: 'الموظفون', icon: '👥' },
    { id: 'payroll', label: 'إدارة الرواتب', icon: '💰' },
    { id: 'attendance', label: 'الحضور والانصراف', icon: '⏰' },
    { id: 'leaves', label: 'طلبات الإجازة', icon: '📅' },
    { id: 'settings', label: 'إعدادات الخصومات', icon: '⚙️' },
    { id: 'ai-assistant', label: 'مساعد HR الذكي', icon: '✨' },
  ];

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 right-0 z-30 w-64 bg-indigo-900 text-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 text-2xl font-bold border-b border-indigo-800 flex items-center justify-between lg:justify-start gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏢</span>
            <span>HR Pro</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-2xl">✕</button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as ViewType)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-800 text-xs text-indigo-300 text-center">
          © 2024 نظام إدارة الموارد البشرية
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-indigo-900">
              <span className="text-2xl">☰</span>
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-gray-800">
              {navItems.find(i => i.id === currentView)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">أحمد المدير</p>
              <p className="text-xs text-gray-500">مدير الموارد البشرية</p>
            </div>
            <img src="https://picsum.photos/seed/admin/40/40" alt="Profile" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
