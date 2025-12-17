
import React from 'react';
import type { User } from '../types';

interface SidebarProps {
  user: User;
  currentPage: string;
  setPage: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, setPage, onLogout, isOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', roles: [1, 2, 3] },
    { id: 'incident-entry', label: 'घटनाओं की प्रविष्टि', icon: '📝', roles: [3] }, // District only
    { id: 'tehsil-report', label: 'घटना प्रतिवेदन (तहसील)', icon: '📊', roles: [3] }, // District only
    { id: 'monitoring-report', label: 'घटना प्रतिवेदन (राज्य)', icon: '📈', roles: [1, 2] }, // State/Admin
    { id: 'district-damage-chart', label: 'क्षति विश्लेषण (ग्राफ)', icon: '📊', roles: [1, 2] }, // State/Admin Chart
    { id: 'incident-categories', label: 'घटनाओं की श्रेणी', icon: '🗂️', roles: [1, 2] }, // Admin/State
    { id: 'user-management', label: 'उपयोगकर्ता प्रबंधन', icon: '👥', roles: [1, 2] },
    { id: 'profile', label: 'Profile', icon: '👤', roles: [1, 2, 3] },
    { id: 'change-password', label: 'Change Password', icon: '🔑', roles: [1, 2, 3] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.Roll_id));

  if (!isOpen) return null;

  return (
    <div className="w-64 bg-gradient-to-l from-slate-300 to-indigo-200 text-slate-700 flex flex-col h-full shadow-2xl transition-all duration-300 fixed inset-y-0 left-0 z-50 md:static border-r border-white/50">
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {filteredMenu.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                  currentPage === item.id 
                    ? 'bg-gradient-to-l from-slate-500 to-indigo-400 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]' 
                    : 'text-slate-600 hover:bg-white hover:text-blue-700 hover:shadow-md hover:shadow-blue-100/50 hover:translate-x-1'
                }`}
              >
                <span className={`text-xl transition-transform duration-300 ${currentPage === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="font-medium tracking-wide text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-blue-100 bg-white/40 backdrop-blur-sm">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-600 py-2.5 rounded-xl shadow-sm hover:bg-red-50 hover:shadow-md transition-all duration-200 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">🚪</span> 
          <span className="font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
};
