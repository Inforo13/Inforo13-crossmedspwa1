import React from 'react';
import { User } from 'firebase/auth';
import { 
  LogOut, 
  User as UserIcon, 
  Pill, 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  Stethoscope,
  Home,
  Heart,
  Bell,
  FileBarChart
} from 'lucide-react';

interface Props {
  user: User;
  onSignOut: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ user, onSignOut, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: <Home size={24} /> },
    { id: 'medications', label: 'Remédios', icon: <Pill size={24} /> },
    { id: 'followup', label: 'Acompanha.', icon: <Heart size={24} /> },
    { id: 'reminders', label: 'Lembretes', icon: <Bell size={24} /> },
    { id: 'reports', label: 'Relatório', icon: <FileBarChart size={24} /> },
  ];

  return (
    <>
      {/* Top Navbar for Desktop */}
      <nav className="bg-white border-b border-zinc-200 sticky top-0 z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('dashboard')}>
                <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <Pill className="text-white" size={20} />
                </div>
                <span className="text-xl font-black text-zinc-900 tracking-tight">CrossMeds</span>
              </div>
              
              <div className="flex items-center gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-500 hover:bg-zinc-50'
                    }`}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement, { size: 18 })}
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={() => onTabChange('portal')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'portal' ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  <Stethoscope size={18} />
                  Portal
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-7 h-7 rounded-full border border-white shadow-sm" />
                ) : (
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                    <UserIcon size={14} className="text-emerald-600" />
                  </div>
                )}
                <span className="text-sm font-bold text-zinc-700">
                  {user.displayName?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50 md:hidden px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id ? 'text-emerald-600' : 'text-zinc-400'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};
