
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Employee } from '../types';

interface DashboardProps {
  employees: Employee[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export const Dashboard: React.FC<DashboardProps> = ({ employees }) => {
  const totalEmployees = employees.length;
  
  const deptCount = employees.reduce((acc: any, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  const deptData = Object.keys(deptCount).map(name => ({
    name,
    value: deptCount[name]
  }));

  const growthData = [
    { name: 'مارس', employees: totalEmployees - 2 > 0 ? totalEmployees - 2 : 1 },
    { name: 'أبريل', employees: totalEmployees - 1 > 0 ? totalEmployees - 1 : 1 },
    { name: 'مايو', employees: totalEmployees },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي الموظفين', value: totalEmployees.toString(), icon: '👥', color: 'bg-blue-500' },
          { label: 'الحضور اليوم', value: '94%', icon: '✅', color: 'bg-green-500' },
          { label: 'طلبات إجازة معلقة', value: '5', icon: '⏳', color: 'bg-yellow-500' },
          { label: 'إجمالي الرواتب', value: employees.reduce((s, e) => s + e.baseSalary, 0).toLocaleString(), icon: '💰', color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
            <div className={`${stat.color} text-white p-3 rounded-lg text-2xl`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">نمو عدد الموظفين</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="employees" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">توزيع الموظفين حسب القسم</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData.length > 0 ? deptData : [{name: 'لا يوجد بيانات', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
