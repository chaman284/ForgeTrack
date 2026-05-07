import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';

export default function MainLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen text-text-primary font-body overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <motion.div 
        animate={{ marginLeft: isCollapsed ? '0px' : '0px' }} // Adjusted by the flex layout
        className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300"
      >
        <TopBar />
        {/* Main content area with smooth page transitions */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto scroll-fade-mask no-scrollbar relative">
          <div className="max-w-[1440px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <MobileNav />
      </motion.div>
    </div>
  );
}


