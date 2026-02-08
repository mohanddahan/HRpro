
import React from 'react';
import { LeaveRequest } from '../types';

interface LeaveRequestsProps {
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
}

export const LeaveRequests: React.FC<LeaveRequestsProps> = ({ leaves, setLeaves }) => {
  const updateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
  };

  return (
    <div className="space-y-4">
      {leaves.map((req) => (
        <div key={req.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl">📅</div>
            <div>
              <h4 className="font-bold">{req.employeeName}</h4>
              <p className="text-sm text-gray-500">{req.type} - {req.duration}</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            من: {req.from} - إلى: {req.to}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {req.status === 'Pending' ? (
              <>
                <button 
                  onClick={() => updateStatus(req.id, 'Approved')}
                  className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
                >
                  قبول
                </button>
                <button 
                  onClick={() => updateStatus(req.id, 'Rejected')}
                  className="flex-1 md:flex-none bg-red-600 text-white px-6 py-2 rounded-lg font-bold"
                >
                  رفض
                </button>
              </>
            ) : (
              <span className={`px-6 py-2 rounded-lg font-bold w-full text-center ${
                req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {req.status === 'Approved' ? 'تمت الموافقة' : 'تم الرفض'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
