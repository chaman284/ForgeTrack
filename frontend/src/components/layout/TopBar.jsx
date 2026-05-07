import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Search, Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Overview / Dashboard';
    if (path.includes('attendance') && !path.includes('me')) return 'Activity / Mark Attendance';
    if (path.includes('history')) return 'Activity / Student History';
    if (path.includes('materials') && !path.includes('me')) return 'Activity / Materials';
    if (path.includes('upload')) return 'Data / Upload CSV';
    if (path.includes('me/attendance')) return 'Overview / My Attendance';
    if (path.includes('me/upcoming')) return 'Overview / Upcoming';
    if (path.includes('me/materials')) return 'Resources / Materials';
    return 'Overview';
  };

  return (
    <header className="h-[88px] px-8 flex items-center justify-between bg-transparent z-10">
      <div className="flex items-center gap-6">
        <button className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-border-subtle">
          <Menu size={20} className="text-text-primary" />
        </button>
        <div>
          <h2 className="text-xl font-display font-bold text-text-primary">{getBreadcrumb().split(' / ').pop()}</h2>
          <div className="text-[11px] text-text-tertiary font-bold uppercase tracking-widest mt-0.5">
            {getBreadcrumb()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="w-[280px] bg-white border border-border-subtle rounded-2xl pl-12 pr-4 h-[48px] text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-indigo outline-none transition-all shadow-sm"
          />
        </div>

        <button className="p-3 bg-white rounded-2xl border border-border-subtle text-text-secondary hover:text-primary-indigo transition-colors shadow-sm relative">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border-default ml-2">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-text-primary">{user?.display_name || 'User'}</div>
            <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">Active Now</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-primary-soft border border-primary-indigo/20 flex items-center justify-center text-primary-indigo font-bold text-lg shadow-sm">
            {user?.display_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

