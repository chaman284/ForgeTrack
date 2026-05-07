import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthContext';
import { 
  CalendarDays, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  MoreHorizontal,
  Zap
} from 'lucide-react';
import welcomeIllustration from '../../assets/illustrations/welcome.png';

export default function MyAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    percentage: 0,
    attended: 0,
    total: 0,
    streak: 0,
    bestStreak: 0
  });
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [studentInfo, setStudentInfo] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      if (user.student_id) {
        fetchAttendanceData();
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.student_id)
        .single();
      setStudentInfo(profile);

      const { data: allSessions } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false });

      const { data: myAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', user.student_id);

      const attendanceMap = {};
      myAttendance?.forEach(a => {
        attendanceMap[a.session_id] = a.present;
      });

      setSessions(allSessions || []);
      setAttendance(attendanceMap);

      const attendedCount = myAttendance?.filter(a => a.present).length || 0;
      const totalSessions = allSessions?.length || 0;
      const pct = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0;

      let currentS = 0;
      for (const s of (allSessions || [])) {
        if (attendanceMap[s.id] === true) {
          currentS++;
        } else if (attendanceMap[s.id] === false || !attendanceMap[s.id]) {
          break;
        }
      }

      let maxStreak = 0;
      let tempStreak = 0;
      const sortedSessions = [...(allSessions || [])].reverse();
      sortedSessions.forEach(s => {
        if (attendanceMap[s.id] === true) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      });

      setStats({
        percentage: pct,
        attended: attendedCount,
        total: totalSessions,
        streak: currentS,
        bestStreak: maxStreak
      });

    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-8">
        <div className="h-48 bg-white rounded-[32px] w-full shadow-sm"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white rounded-2xl shadow-sm"></div>
          <div className="h-32 bg-white rounded-2xl shadow-sm"></div>
          <div className="h-32 bg-white rounded-2xl shadow-sm"></div>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const monthYearString = currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 relative overflow-hidden">
      {/* Decorative Floating Graphics */}
      <motion.div 
        animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-1/2 w-48 h-48 bg-primary-indigo/5 rounded-full blur-3xl -z-10"
      />
      <motion.div 
        animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-20 w-64 h-64 bg-accent/5 rounded-full blur-[120px] -z-10"
      />

      <div className="mb-12">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary-indigo text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-indigo/20"
          >
            <CalendarDays size={14} className="animate-pulse" />
            Performance Tracking
          </motion.div>
          <h1 className="super-title text-text-primary flex items-center gap-4">

            My Attendance
          </h1>
        </div>
      </div>
      
      <motion.div variants={item} className="bg-primary-indigo rounded-[40px] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl border border-white/20">
        <div className="relative z-10 space-y-6 text-center md:text-left">
          <h1 className="super-title !text-white">Hello, {studentInfo?.name?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="text-primary-soft/80 text-xl font-medium max-w-md leading-relaxed">
            You've attended <span className="text-white font-black underline decoration-white/30 underline-offset-8">{stats.attended}</span> out of <span className="text-white font-black">{stats.total}</span> sessions this program.
          </p>
          <button className="bg-white text-primary-indigo px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-black/20 active:scale-95">
            View Analytics
          </button>
        </div>
        <motion.img 
          animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          src={welcomeIllustration} 
          alt="Welcome" 
          className="w-full max-w-[320px] md:max-w-[440px] mt-8 md:mt-0 drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative z-10 transform"
        />
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="card-plate flex items-center gap-6">
          <div className="w-14 h-14 bg-primary-soft rounded-2xl flex items-center justify-center text-primary-indigo">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">Attendance</p>
            <p className="text-2xl font-display font-bold text-text-primary">{Math.round(stats.percentage)}%</p>
          </div>
        </motion.div>
        <motion.div variants={item} className="card-plate flex items-center gap-6">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
            <Award size={28} />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">Best Streak</p>
            <p className="text-2xl font-display font-bold text-text-primary">{stats.bestStreak} Days</p>
          </div>
        </motion.div>
        <motion.div variants={item} className="card-plate flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">Current Streak</p>
            <p className="text-2xl font-display font-bold text-text-primary">{stats.streak} Days</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar Section */}
        <motion.div variants={item} className="lg:col-span-1 space-y-6">
          <div className="card-plate">
            <div className="flex flex-wrap items-center justify-between mb-8 gap-2">
              <h3 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] flex items-center gap-2 shrink-0">
                Schedule
              </h3>
              <div className="flex items-center gap-0.5 bg-bg-main p-0.5 rounded-lg border border-border-default overflow-hidden">
                <button onClick={prevMonth} className="p-1 hover:bg-white rounded-md transition-all"><ChevronLeft size={12} /></button>
                <span className="text-[9px] font-black px-1.5 min-w-[60px] text-center uppercase tracking-tighter">{monthYearString}</span>
                <button onClick={nextMonth} className="p-1 hover:bg-white rounded-md transition-all"><ChevronRight size={12} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <div key={idx} className="text-[10px] font-black text-text-tertiary text-center mb-1 uppercase opacity-30">{d}</div>
              ))}
              {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const sessionForDay = sessions.find(s => s.date === dateStr);
                const isPresent = sessionForDay ? attendance[sessionForDay.id] : null;
                const isToday = new Date().toLocaleDateString('en-CA') === dateStr;
                
                return (
                  <div 
                    key={day}
                    className={`
                      aspect-square min-h-[38px] rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-help relative group
                      ${sessionForDay ? 
                        (isPresent === true ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-inner' : 
                         isPresent === false ? 'bg-rose-500/10 border-rose-500 text-rose-600 shadow-inner' : 
                         'bg-white border-border-default text-text-primary') : 
                        'bg-white/40 border-transparent text-text-secondary opacity-30'}
                      ${isToday ? 'ring-1 ring-primary-indigo ring-offset-1' : ''}
                      hover:scale-105 hover:z-10
                    `}
                  >
                    <span className={`text-[11px] ${sessionForDay ? 'font-black' : 'font-medium'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Table */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="card-plate !p-0 overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-white">
              <h3 className="text-xl font-display font-bold text-text-primary">Recent Sessions</h3>
              <button className="text-primary-indigo hover:bg-primary-soft p-2 rounded-xl transition-colors"><MoreHorizontal size={20} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main">
                    <th className="p-4 text-[11px] font-bold text-text-tertiary uppercase tracking-widest">Topic</th>
                    <th className="p-4 text-[11px] font-bold text-text-tertiary uppercase tracking-widest text-center">Status</th>
                    <th className="p-4 text-[11px] font-bold text-text-tertiary uppercase tracking-widest text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {sessions.slice(0, 8).map(s => (
                    <tr key={s.id} className="hover:bg-bg-main transition-colors group">
                      <td className="p-4">
                        <div className="text-sm font-bold text-text-primary group-hover:text-primary-indigo transition-colors">{s.topic}</div>
                        <div className="text-[10px] text-text-tertiary font-medium">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`
                          px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                          ${attendance[s.id] === true ? 'bg-success-soft text-success border border-success/20' : 
                            attendance[s.id] === false ? 'bg-danger-soft text-danger border border-danger/20' : 
                            'bg-bg-main text-text-tertiary'}
                        `}>
                          {attendance[s.id] === true ? 'Present' : attendance[s.id] === false ? 'Absent' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-text-secondary text-right">
                        {s.duration_hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

