import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Flame, Award, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StudentHistory() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function fetchStudents() {
      const { data } = await supabase
        .from('students')
        .select('*')
        .order('name');
      setStudents(data || []);
      setLoading(false);
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    async function fetchHistory() {
      const { data } = await supabase
        .from('attendance')
        .select(`
          present,
          marked_at,
          sessions (
            id, date, topic, duration_hours, session_type
          )
        `)
        .eq('student_id', selectedStudent.id)
        .order('sessions(date)', { ascending: true });
        
      if (data) {
        const sorted = data.sort((a, b) => new Date(a.sessions?.date) - new Date(b.sessions?.date));
        setAttendanceData(sorted);
      } else {
        setAttendanceData([]);
      }
    }
    fetchHistory();
  }, [selectedStudent]);

  const filteredStudents = search.trim() === '' 
    ? [] 
    : students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.usn.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5);

  const handleSelect = (s) => {
    setSelectedStudent(s);
    setSearch('');
  };

  const stats = useMemo(() => {
    if (!attendanceData.length) return { present: 0, total: 0, percent: 0, currentStreak: 0, maxStreak: 0 };
    
    let present = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    attendanceData.forEach(row => {
      if (row.present) {
        present++;
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        currentStreak = tempStreak;
      } else {
        tempStreak = 0;
        currentStreak = 0;
      }
    });

    const total = attendanceData.length;
    const percent = Math.round((present / total) * 100);

    return { present, total, percent, currentStreak, maxStreak };
  }, [attendanceData]);

  const getPercentColor = (percent) => {
    if (percent >= 75) return 'text-success bg-success-bg border-success-border';
    if (percent >= 60) return 'text-warning bg-warning-bg border-warning-border';
    return 'text-danger bg-danger-bg border-danger-border';
  };

  // Calendar Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const monthYearString = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Search Bar */}
      <div className="max-w-xl relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" size={20} />
          <input 
            type="text" 
            placeholder="Search student by name or USN..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface bg-card-gradient border border-subtle rounded-xl pl-12 pr-4 h-[56px] text-primary text-[16px] focus:border-accent-glow focus:shadow-[var(--shadow-focus)] outline-none placeholder:text-tertiary transition-all"
          />
        </div>
        
        {search.trim() !== '' && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-subtle rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
            {filteredStudents.length > 0 ? (
              <ul>
                {filteredStudents.map(s => (
                  <li 
                    key={s.id} 
                    onClick={() => handleSelect(s)}
                    className="p-4 hover:bg-surface-raised cursor-pointer border-b border-subtle last:border-0 flex justify-between items-center group transition-colors"
                  >
                    <span className="text-body text-primary group-hover:text-accent-glow transition-colors">{s.name}</span>
                    <span className="text-caption text-tertiary font-mono">{s.usn}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-secondary text-sm text-center">No students found.</div>
            )}
          </div>
        )}
      </div>

      {!selectedStudent && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-subtle rounded-3xl bg-surface-inset/30">
          <div className="w-20 h-20 rounded-full bg-surface-raised border border-default flex items-center justify-center mb-6 text-tertiary opacity-40">
            <Search size={32} />
          </div>
          <h3 className="text-h3 text-primary mb-2">Ready to Analyze</h3>
          <p className="text-body text-secondary max-w-sm">Search for a student above to view their complete attendance performance and history.</p>
        </div>
      )}

      {selectedStudent && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card: Profile */}
            <div className="card-plate h-fit">
              <div className="w-16 h-16 rounded-full bg-surface-raised border border-default flex items-center justify-center text-primary font-display text-2xl mb-6 shadow-inner">
                {selectedStudent.name.charAt(0)}
              </div>
              <h2 className="text-h2 text-primary mb-1">{selectedStudent.name}</h2>
              <p className="text-body text-tertiary font-mono mb-8 tracking-wider">{selectedStudent.usn}</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-subtle">
                  <span className="text-sm text-secondary uppercase tracking-widest text-[10px] font-bold">Branch</span>
                  <span className="text-sm font-medium text-primary">{selectedStudent.branch_code}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-subtle">
                  <span className="text-sm text-secondary uppercase tracking-widest text-[10px] font-bold">Batch</span>
                  <span className="text-sm font-medium text-primary">{selectedStudent.batch}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-secondary uppercase tracking-widest text-[10px] font-bold">Status</span>
                  {selectedStudent.is_active 
                    ? <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-bg text-success border border-success-border">Active</span>
                    : <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-raised text-secondary border border-default">Inactive</span>
                  }
                </div>
              </div>
            </div>

            {/* Right Card: Stats & Calendar */}
            <div className="lg:col-span-2 card-plate flex flex-col">
              <div className="flex flex-wrap gap-4 mb-8">
                <div className={`px-4 py-4 rounded-xl border flex-1 min-w-[140px] flex flex-col justify-center ${getPercentColor(stats.percent)}`}>
                  <span className="text-micro uppercase tracking-widest opacity-80 mb-1 font-bold">Attendance Rate</span>
                  <span className="text-h2 font-display">{stats.percent}%</span>
                </div>
                <div className="px-4 py-4 rounded-xl border border-default bg-surface-inset text-primary flex-1 min-w-[140px] flex flex-col justify-center shadow-inner">
                  <span className="text-micro text-tertiary uppercase tracking-widest mb-1 flex items-center gap-1 font-bold"><Flame size={12}/> Current Streak</span>
                  <span className="text-h2 font-display">{stats.currentStreak}</span>
                </div>
                <div className="px-4 py-4 rounded-xl border border-default bg-surface-inset text-primary flex-1 min-w-[140px] flex flex-col justify-center shadow-inner">
                  <span className="text-micro text-tertiary uppercase tracking-widest mb-1 flex items-center gap-1 font-bold"><Award size={12}/> Best Streak</span>
                  <span className="text-h2 font-display">{stats.maxStreak}</span>
                </div>
              </div>

              {/* Calendar Redesign */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-body-sm font-bold text-secondary flex items-center gap-2 uppercase tracking-widest">
                    Monthly Insights
                  </h3>
                  <div className="flex items-center gap-1 bg-surface-inset p-1 rounded-lg border border-subtle">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-surface-raised rounded-md text-secondary hover:text-primary transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[11px] font-bold text-primary px-2 min-w-[90px] text-center">
                      {monthYearString}
                    </span>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-surface-raised rounded-md text-secondary hover:text-primary transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-tertiary text-center mb-2">{d}</div>
                  ))}
                  
                  {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  
                  {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const sessionData = attendanceData.find(row => row.sessions?.date === dateStr);
                    const isPresent = sessionData?.present;
                    
                    return (
                      <div 
                        key={day}
                        title={sessionData ? `${sessionData.sessions.topic}` : 'No session'}
                        className={`
                          aspect-square rounded-lg border flex flex-col items-center justify-center transition-all cursor-help relative group
                          ${sessionData ? 
                            (isPresent === true ? 'bg-success-bg border-success-border text-success' : 
                             'bg-danger-bg border-danger-border text-danger') : 
                            'bg-surface-inset/30 border-subtle/5 text-tertiary opacity-40'}
                        `}
                      >
                        <span className="text-[11px] font-bold">{day}</span>
                        {sessionData && (
                          <div className={`w-1 h-1 rounded-full mt-1 ${isPresent ? 'bg-success' : 'bg-danger'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card-plate !p-0 overflow-hidden">
            <div className="p-6 border-b border-subtle bg-surface/30">
              <h3 className="text-h3 text-primary">Session Details</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-surface-raised border-b border-subtle">
                  <tr>
                    <th className="p-4 text-label text-tertiary uppercase tracking-widest font-bold text-[10px]">Date</th>
                    <th className="p-4 text-label text-tertiary uppercase tracking-widest font-bold text-[10px]">Topic</th>
                    <th className="p-4 text-label text-tertiary uppercase tracking-widest font-bold text-[10px]">Type</th>
                    <th className="p-4 text-label text-tertiary uppercase tracking-widest font-bold text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {attendanceData.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-raised transition-colors group">
                      <td className="p-4 text-sm text-secondary font-mono">{new Date(row.sessions?.date).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-primary font-medium group-hover:text-accent-glow transition-colors">{row.sessions?.topic}</td>
                      <td className="p-4 text-sm text-tertiary capitalize">{row.sessions?.session_type}</td>
                      <td className="p-4">
                        {row.present 
                          ? <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-bg text-success border border-success-border">Present</span>
                          : <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-danger-bg text-danger border border-danger-border">Absent</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {attendanceData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-secondary italic">No sessions found for this student.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
