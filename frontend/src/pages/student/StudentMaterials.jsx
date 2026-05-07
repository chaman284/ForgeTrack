import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink, 
  LayoutGrid,
  Calendar,
  Layers,
  ChevronDown,
  Zap
} from 'lucide-react';

export default function StudentMaterials() {
  const [sessionsWithMaterials, setSessionsWithMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Fetch sessions and their materials
      const { data, error } = await supabase
        .from('sessions')
        .select('*, materials(*)')
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Filter out sessions that have no materials
      setSessionsWithMaterials(data?.filter(s => s.materials && s.materials.length > 0) || []);
    } catch (err) {
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessionsWithMaterials.filter(session => {
    const matchesSearch = session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        session.materials.some(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMonth = selectedMonth === 'all' || session.month_number.toString() === selectedMonth;
    
    return matchesSearch && matchesMonth;
  });

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'recording': return <Video size={18} className="text-danger" />;
      case 'slides': return <LayoutGrid size={18} className="text-warning" />;
      case 'document': return <FileText size={18} className="text-info" />;
      default: return <ExternalLink size={18} className="text-accent-glow" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-14 bg-surface-raised rounded-xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-surface-raised rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 relative overflow-hidden">
      {/* Decorative Floating Graphics */}
      <motion.div 
        animate={{ y: [0, 60, 0], x: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-20 w-40 h-40 bg-primary-indigo/5 rounded-full blur-3xl -z-10"
      />
      <motion.div 
        animate={{ y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-56 h-56 bg-accent/5 rounded-full blur-3xl -z-10"
      />

      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 pb-12 border-b border-white/20">
        <div className="space-y-4">

          <div>
            <h1 className="super-title text-text-primary flex items-center gap-4">

              Class Assets
            </h1>
          </div>
          <p className="text-lg text-text-secondary max-w-xl font-medium leading-relaxed">
            Premium bootcamp resources, recordings, and industry-standard notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="relative group flex-1 min-w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary-indigo transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Search by topic or filename..."
              className="w-full pl-14 pr-6 py-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl text-[15px] font-black text-text-primary placeholder:text-text-tertiary focus:bg-white focus:border-primary-indigo focus:shadow-2xl outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select 
              className="appearance-none pl-12 pr-12 py-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl text-[15px] font-black text-text-primary focus:bg-white focus:border-primary-indigo outline-none transition-all cursor-pointer min-w-[180px] shadow-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">Full Program</option>
              <option value="4">Module 04</option>
              <option value="5">Module 05</option>
              <option value="6">Module 06</option>
            </select>
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={20} />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredSessions.map((session) => (
            <div key={session.id} className="glass-plate group !p-0 overflow-hidden flex flex-col hover:border-primary-indigo/30 transform hover:-translate-y-2 transition-all duration-500">
              <div className="p-8 pb-6 bg-white/10 relative overflow-hidden">
                {/* Background Accent Shape */}
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary-indigo/5 rounded-full blur-2xl group-hover:bg-primary-indigo/10 transition-all"></div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl text-[12px] font-black text-primary-indigo uppercase tracking-widest shadow-sm font-mono border border-primary-indigo/10">
                    <Calendar size={14} />
                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-text-primary px-3 py-2 rounded-xl shadow-lg">
                    EXP-{session.month_number}
                  </span>
                </div>

                <h3 className="text-[28px] font-display font-black text-text-primary mb-2 line-clamp-2 min-h-[72px] leading-[1.1] group-hover:text-primary-indigo transition-colors tracking-tighter">
                  {session.topic}
                </h3>
              </div>

              <div className="flex-1 p-6 space-y-4 bg-white/30 backdrop-blur-md">
                {session.materials.map((m) => (
                  <motion.a 
                    whileHover={{ scale: 1.02, x: 10 }}
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 bg-white/60 border border-white/60 hover:border-primary-indigo hover:bg-white rounded-[24px] transition-all shadow-sm group/item"
                  >
                    <div className={`p-4 rounded-2xl shadow-inner transition-transform group-hover/item:rotate-12 ${
                      m.type === 'recording' ? 'bg-rose-100 text-rose-500' : 
                      m.type === 'slides' ? 'bg-amber-100 text-amber-500' : 
                      'bg-sky-100 text-sky-500'
                    }`}>
                      {getMaterialIcon(m.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[15px] font-black text-text-primary truncate group-hover/item:text-primary-indigo transition-colors">{m.title}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 px-2 py-0.5 rounded-full w-fit ${
                        m.type === 'recording' ? 'bg-rose-500/10 text-rose-600' : 
                        m.type === 'slides' ? 'bg-amber-500/10 text-amber-600' : 
                        'bg-sky-500/10 text-sky-600'
                      }`}>{m.type}</p>
                    </div>
                    <ExternalLink size={18} className="text-text-tertiary opacity-0 group-hover/item:opacity-100 transition-all" />
                  </motion.a>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 bg-white/30 backdrop-blur-md border-4 border-dashed border-white/60 rounded-[48px] shadow-inner">
          <div className="w-28 h-28 bg-white rounded-[40px] flex items-center justify-center text-text-tertiary shadow-2xl">
            <Layers size={56} className="opacity-20" />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-display font-black text-text-primary">No results found</h3>
            <p className="text-lg text-text-secondary font-medium max-w-sm mx-auto leading-relaxed">We couldn't find any materials matching your search. Try broadening your criteria.</p>
          </div>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedMonth('all');}}
            className="px-8 py-3 bg-primary-indigo text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-indigo/20 hover:scale-105 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Help Banner */}
      <div className="bg-surface-raised/50 border border-subtle rounded-3xl p-8 flex items-center gap-8 shadow-inner">
        <div className="p-4 bg-surface rounded-2xl text-accent-glow">
          <BookOpen size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-body-lg font-bold text-primary">Missed a session?</h4>
          <p className="text-body-sm text-secondary">All recordings and slides are uploaded within 24 hours of the class completion. You can catch up on any missed topics here.</p>
        </div>
      </div>

    </div>
  );
}
