import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../components/auth/AuthContext';
import TickerStrip from './dashboard/TickerStrip';
import TodaySessionCard from './dashboard/TodaySessionCard';
import TodayAttendanceCard from './dashboard/TodayAttendanceCard';
import ProgramOverviewCard from './dashboard/ProgramOverviewCard';
import RecentActivityCard from './dashboard/RecentActivityCard';
import { LayoutDashboard, Zap } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative overflow-hidden">
      {/* Decorative Floating Graphics */}
      <motion.div 
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-10 w-32 h-32 bg-primary-indigo/10 rounded-full blur-3xl -z-10"
      />
      <motion.div 
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10"
      />

      {/* Hero Section */}
      <div className="mb-12">
        <div className="space-y-4">

          <h1 className="super-title text-text-primary flex items-center gap-4">

            Welcome Back, {user?.display_name?.split(' ')[0] || 'Mentor'}
          </h1>
          <p className="text-lg text-text-secondary max-w-xl font-medium leading-relaxed">
            Here's what's happening with the Forge AI-ML Bootcamp today.
          </p>
        </div>
      </div>



      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Row 1: Today's Focus (takes up 2 columns each on large screens, or 1 each on XL) */}
        <div className="xl:col-span-2">
          <TodaySessionCard />
        </div>
        <div className="xl:col-span-2">
          <TodayAttendanceCard />
        </div>

        {/* Row 2: Analytics & Activity */}
        <div className="xl:col-span-2">
          <ProgramOverviewCard />
        </div>
        <div className="xl:col-span-2">
          <RecentActivityCard />
        </div>
        
      </div>
    </div>
  );
}
