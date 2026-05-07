import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthContext';
import { 
  Calendar, 
  Users, 
  AlertTriangle, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Plus, 
  Play, 
  Layers, 
  ShieldCheck, 
  Edit2, 
  Save, 
  X
} from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function MarkAttendance() {
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monthlySessions, setMonthlySessions] = useState([]);
  
  // Session creation/edit form state
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('offline');
  const [duration, setDuration] = useState(2.0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTopic, setEditTopic] = useState('');
  const [editType, setEditType] = useState('offline');
  const [editDuration, setEditDuration] = useState(2.0);
  
  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataForDate(date);
  }, [date]);

  useEffect(() => {
    fetchMonthlySessions();
  }, [currentMonth]);

  async function fetchMonthlySessions() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    const { data } = await supabase
      .from('sessions')
      .select('date, id, topic')
      .gte('date', startDate)
      .lte('date', endDate);
    
    setMonthlySessions(data || []);
  }

  async function fetchDataForDate(selectedDate) {
    setLoading(true);
    setSessions([]);
    setSelectedSessionId(null);
    setIsEditing(false);
    
    try {
      const { data: studentData } = await supabase
        .from('students')
        .select('id, name, usn')
        .eq('is_active', true)
        .order('name');
        
      setStudents(studentData || []);
      
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('*')
        .eq('date', selectedDate)
        .order('created_at', { ascending: true });

      if (sessionData && sessionData.length > 0) {
        setSessions(sessionData);
        setSelectedSessionId(sessionData[0].id);
        fetchAttendanceForSession(sessionData[0].id, studentData);
      } else {
        const initialMap = {};
        studentData?.forEach(s => initialMap[s.id] = true); // Default to present for new
        setAttendance(initialMap);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendanceForSession(sessionId, studentData) {
    const { data: attData } = await supabase
      .from('attendance')
      .select('student_id, present')
      .eq('session_id', sessionId);
      
    const newMap = {};
    const existingIds = new Set(attData?.map(a => a.student_id));
    
    studentData.forEach(s => {
      if (existingIds.has(s.id)) {
        newMap[s.id] = attData.find(a => a.student_id === s.id).present;
      } else {
        newMap[s.id] = true; // Default for missing records in existing session
      }
    });
    setAttendance(newMap);
  }

  const handleSessionChange = (id) => {
    setSelectedSessionId(id);
    setIsEditing(false);
    fetchAttendanceForSession(id, students);
  };

  const startEditing = (s) => {
    setEditTopic(s.topic);
    setEditType(s.session_type);
    setEditDuration(s.duration_hours);
    setIsEditing(true);
  };

  const handleUpdateSession = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          topic: editTopic,
          session_type: editType,
          duration_hours: editDuration
        })
        .eq('id', selectedSessionId);

      if (error) throw error;
      
      setSessions(prev => prev.map(s => s.id === selectedSessionId ? { ...s, topic: editTopic, session_type: editType, duration_hours: editDuration } : s));
      setIsEditing(false);
      fetchMonthlySessions();
    } catch (err) {
      alert("Failed to update session: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const monthNum = new Date(date).getMonth() + 1;
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          date,
          topic,
          session_type: type,
          duration_hours: duration,
          month_number: monthNum
        }])
        .select()
        .single();
        
      if (error) throw error;
      setSessions(prev => [...prev, data]);
      setSelectedSessionId(data.id);
      setTopic('');
      fetchMonthlySessions();
    } catch (err) {
      alert("Failed to create session: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const executeSave = async () => {
    setSaving(true);
    setShowConfirmModal(false);
    
    try {
      const records = students.map(s => ({
        student_id: s.id,
        session_id: selectedSessionId,
        present: attendance[s.id] ?? true,
        marked_by: user.display_name
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,session_id' });

      if (error) throw error;
      alert("Attendance saved successfully!");
      navigate('/dashboard');
    } catch (err) {
      alert("Failed to save attendance: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStudent = (id) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setAll = (val) => {
    const newMap = {};
    students.forEach(s => newMap[s.id] = val);
    setAttendance(newMap);
  };

  // Calendar Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const monthYearString = currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' });

  const currentSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-12 px-4 relative overflow-hidden">
      {/* Decorative Floating Graphics */}
      <motion.div 
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 w-32 h-32 bg-primary-indigo/10 rounded-full blur-3xl -z-10"
      />
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 45, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10"
      />

      <div className="mb-12">
        <div className="space-y-4">

          <h1 className="super-title text-text-primary flex items-center gap-4">

            Attendance Console
          </h1>
          <p className="text-lg text-text-secondary max-w-xl font-medium leading-relaxed">Track student participation with high-contrast feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left: Controls & Session Creation */}
        <div className="xl:col-span-1 space-y-6">
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
                const dStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasSession = monthlySessions.some(s => s.date === dStr);
                const isSelected = date === dStr;
                const isToday = new Date().toLocaleDateString('en-CA') === dStr;

                return (
                  <button 
                    key={day}
                    onClick={() => setDate(dStr)}
                    className={`
                      aspect-square min-h-[38px] rounded-lg border flex flex-col items-center justify-center transition-all relative group overflow-hidden
                      ${isSelected ? 'bg-primary-indigo border-primary-indigo text-white shadow-xl z-10 scale-105' : 
                        hasSession ? 'bg-primary-soft border-primary-indigo/10 text-primary-indigo font-black' : 
                        'bg-white/40 border-transparent text-text-secondary hover:bg-white'}
                      ${isToday && !isSelected ? 'ring-1 ring-primary-indigo ring-offset-1' : ''}
                    `}
                  >
                    <span className={`text-[11px] ${isSelected || hasSession ? 'font-black' : 'font-medium'}`}>{day}</span>
                    {hasSession && !isSelected && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-indigo"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Always Available Creation Form */}
          <div className="card-plate bg-white/50 backdrop-blur-sm">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.1em] mb-6 flex items-center gap-2">
              New Session
            </h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-[10px] text-text-tertiary uppercase font-black mb-1.5 tracking-widest">Topic / Module</label>
                <input required type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Topic name..." className="w-full bg-white border border-border-default rounded-xl px-4 h-[48px] text-[13px] font-black text-text-primary focus:border-primary-indigo outline-none transition-all shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-text-tertiary uppercase font-black mb-1.5 tracking-widest">Format</label>
                  <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-white border border-border-default rounded-xl px-3 h-[48px] text-[12px] font-black text-text-primary outline-none shadow-sm cursor-pointer">
                    <option value="offline">OFFLINE</option>
                    <option value="online">ONLINE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-text-tertiary uppercase font-black mb-1.5 tracking-widest">Hours</label>
                  <input required type="number" step="0.5" min="0.5" value={duration} onChange={e=>setDuration(e.target.value)} className="w-full bg-white border border-border-default rounded-xl px-3 h-[48px] text-[12px] font-black text-text-primary outline-none shadow-sm" />
                </div>
              </div>
              <button disabled={saving} type="submit" className="w-full h-[48px] btn-primary flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                <Play size={14} /> Create
              </button>
            </form>
          </div>
        </div>

        {/* Right: Multi-Session Student Grid */}
        <div className="xl:col-span-3">
          {sessions.length > 0 ? (
            <div className="space-y-6">
              {/* Session Tabs */}
              <div className="flex flex-wrap gap-3 p-2 bg-white/60 backdrop-blur-md border border-border-subtle rounded-[24px] w-fit shadow-sm">
                {sessions.map((s, idx) => (
                  <button 
                    key={s.id}
                    onClick={() => handleSessionChange(s.id)}
                    className={`px-5 py-2.5 rounded-xl text-[12px] font-black transition-all flex items-center gap-2 ${selectedSessionId === s.id ? 'bg-primary-indigo text-white shadow-lg' : 'text-text-secondary hover:text-text-primary hover:bg-white'}`}
                  >
                    <Layers size={14} />
                    S{idx + 1}: {s.topic.substring(0, 15)}{s.topic.length > 15 ? '...' : ''}
                  </button>
                ))}
              </div>

              {currentSession && (
                <motion.div 
                  key={selectedSessionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-plate !p-0 overflow-hidden flex flex-col h-full"
                >
                  <div className="p-8 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/10">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-4">
                          <input 
                            value={editTopic} 
                            onChange={e => setEditTopic(e.target.value)} 
                            className="text-2xl font-black bg-white border border-primary-indigo/30 rounded-xl px-4 py-2 w-full outline-none focus:border-primary-indigo"
                          />
                          <div className="flex items-center gap-4">
                            <select value={editType} onChange={e => setEditType(e.target.value)} className="bg-white border border-border-default rounded-lg px-3 py-1.5 text-[12px] font-black outline-none">
                              <option value="offline">OFFLINE</option>
                              <option value="online">ONLINE</option>
                            </select>
                            <input 
                              type="number" 
                              step="0.5" 
                              value={editDuration} 
                              onChange={e => setEditDuration(e.target.value)} 
                              className="bg-white border border-border-default rounded-lg px-3 py-1.5 text-[12px] font-black w-24 outline-none"
                            />
                            <button onClick={handleUpdateSession} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"><Save size={18} /></button>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-text-tertiary text-white rounded-lg hover:bg-text-secondary transition-all"><X size={18} /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-display font-black text-text-primary tracking-tighter leading-tight">{currentSession.topic}</h2>
                            <button onClick={() => startEditing(currentSession)} className="p-2 text-text-tertiary hover:text-primary-indigo transition-all"><Edit2 size={18} /></button>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="px-3 py-1 bg-primary-indigo text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">{currentSession.session_type}</span>
                            <span className="text-[12px] font-bold text-text-secondary uppercase tracking-widest font-mono bg-white/50 px-2 py-1 rounded-md">{currentSession.duration_hours}H • {new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setAll(true)} className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">Mark All Present</button>
                      <button onClick={() => setAll(false)} className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20">Mark All Absent</button>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {students.map(student => (
                        <motion.button 
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          key={student.id} 
                          onClick={() => toggleStudent(student.id)}
                          className={`
                            p-6 rounded-[32px] border-2 transition-all flex flex-col items-center text-center relative overflow-hidden group shadow-lg
                            ${attendance[student.id] 
                              ? 'bg-emerald-500 border-emerald-400 text-white' 
                              : 'bg-rose-500 border-rose-400 text-white'}
                          `}
                        >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all bg-white/20 shadow-inner group-hover:rotate-12`}>
                            <span className="text-2xl font-black">{student.name.charAt(0)}</span>
                          </div>
                          <p className="text-[14px] font-black leading-tight mb-1">{student.name.split(' ')[0]}</p>
                          <p className="text-[10px] font-black opacity-60 font-mono tracking-tighter">{student.usn}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 border-t border-white/20 bg-white/20 backdrop-blur-md flex items-center justify-between">
                    <div className="text-[14px] font-black text-text-secondary uppercase tracking-[0.1em]">
                      <span className="text-emerald-500 text-xl">{Object.values(attendance).filter(Boolean).length}</span> / {students.length} Confirmed Present
                    </div>
                    <button 
                      onClick={executeSave}
                      disabled={saving}
                      className="btn-primary h-[64px] px-12 text-lg shadow-2xl shadow-primary-indigo/30"
                    >
                      {saving ? 'Processing...' : 'Finalize Attendance'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-20 border-4 border-dashed border-white/40 rounded-[64px] bg-white/10 backdrop-blur-sm">
              <div className="w-32 h-32 rounded-[40px] bg-white border border-border-subtle flex items-center justify-center mb-8 shadow-2xl text-primary-indigo animate-bounce">
                <Users size={64} />
              </div>
              <h3 className="text-3xl font-display font-black text-text-primary mb-4 tracking-tighter">No Active Sessions</h3>
              <p className="text-lg text-text-secondary font-medium max-w-sm mx-auto">Select a date or use the "New Session" console to start tracking participation.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

