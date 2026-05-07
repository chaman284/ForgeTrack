import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  History, 
  BookOpen, 
  Upload, 
  UserCheck, 
  Calendar, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { role, user, signOut } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    
    return (
      <NavLink 
        to={to} 
        className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} h-[56px] ${isCollapsed ? 'w-[56px] mx-auto rounded-full' : 'px-4 rounded-2xl'} transition-all duration-300 group overflow-hidden`}
      >
        {isActive && (
          <motion.div 
            layoutId="sidebar-active"
            className="absolute inset-0 bg-white shadow-lg"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <div className={`relative z-10 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isActive ? 'text-primary-indigo' : 'text-white/70 group-hover:text-white'}`}>
          <div className="shrink-0">
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap font-black tracking-tight"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </NavLink>
    );
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="hidden lg:flex flex-col bg-sidebar-bg h-[calc(100vh-32px)] sticky top-4 m-4 rounded-[32px] shadow-2xl overflow-hidden z-50"
    >
      {/* Brand Header with Hamburger */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'flex-col gap-6' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shrink-0">
            <span className="text-primary-indigo font-display font-black text-2xl">F</span>
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-display font-black text-white whitespace-nowrap tracking-tighter"
            >
              ForgeTrack
            </motion.span>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-3 hover:bg-white/10 rounded-2xl transition-colors text-white/70 hover:text-white ${isCollapsed ? 'mt-2' : ''}`}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* User Profile Card */}
      {!isCollapsed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 mb-8"
        >
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
            <div className="text-sm font-black text-white truncate tracking-tight">
              {user?.display_name || 'User'}
            </div>
            <div className="text-[10px] text-white/50 mt-1 uppercase tracking-widest font-black">
              {role === 'mentor' ? 'Program Mentor' : 'AI-ML Student'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Nav Section */}
      <div className="flex-1 px-4 space-y-8 overflow-y-auto overflow-x-hidden pb-8 no-scrollbar">
        {role === 'mentor' && (
          <div className="space-y-3">
            {!isCollapsed && <div className="text-[10px] font-black text-white/30 uppercase tracking-[2px] px-4 mb-4">Operations</div>}
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" />
            <NavItem to="/attendance" icon={CheckSquare} label="Mark Attendance" />
            <NavItem to="/history" icon={History} label="Student Records" />
            <NavItem to="/materials" icon={BookOpen} label="Learning Assets" />
            <NavItem to="/upload" icon={Upload} label="Data Sync" />
          </div>
        )}

        {role === 'student' && (
          <div className="space-y-3">
            {!isCollapsed && <div className="text-[10px] font-black text-white/30 uppercase tracking-[2px] px-4 mb-4">My Portal</div>}
            <NavItem to="/me/attendance" icon={UserCheck} label="Attendance" />
            <NavItem to="/me/upcoming" icon={Calendar} label="Upcoming" />
            <NavItem to="/me/materials" icon={BookOpen} label="Course Materials" />
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="p-6 mt-auto border-t border-white/5">
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} h-[56px] rounded-2xl text-white/70 hover:text-white hover:bg-rose-500/20 transition-all font-black group ${isCollapsed ? 'rounded-full' : ''}`}
        >
          <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
          {!isCollapsed && <span className="text-sm tracking-tight">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}


