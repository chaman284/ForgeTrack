import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MonitorPlay, FileText, Link as LinkIcon, Book, Trash2, Layers, Calendar, ChevronDown } from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [months, setMonths] = useState([]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formSession, setFormSession] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('slides');
  const [formUrl, setFormUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch all sessions for the dropdown
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false });
      
      setSessions(sessionData || []);

      // Extract unique months for filter
      if (sessionData) {
        const uniqueMonths = [...new Set(sessionData.map(s => s.month_number))].sort((a,b)=>a-b);
        setMonths(uniqueMonths);
      }

      // Fetch materials joined with sessions
      const { data: materialData } = await supabase
        .from('materials')
        .select('*, sessions(topic, date, month_number)')
        .order('created_at', { ascending: false });

      setMaterials(materialData || []);
    } catch (err) {
      console.error("Error fetching materials", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // URL Validation
    try {
      new URL(formUrl);
    } catch (_) {
      setFormError("Please enter a valid URL (e.g. https://google.com)");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([{
          session_id: formSession,
          title: formTitle,
          type: formType,
          url: formUrl,
          description: formDesc
        }])
        .select('*, sessions(topic, date, month_number)')
        .single();

      if (error) throw error;
      
      // Update local state to reflect instantly
      setMaterials([data, ...materials]);
      setShowModal(false);
      
      // Reset form
      setFormSession('');
      setFormTitle('');
      setFormUrl('');
      setFormDesc('');
      setFormType('slides');
      
    } catch (err) {
      setFormError(err.message || 'Failed to add material');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', deletingId);

      if (error) throw error;
      setMaterials(materials.filter(m => m.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      alert("Failed to delete material: " + err.message);
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'slides': return <MonitorPlay size={16} />;
      case 'recording': return <MonitorPlay size={16} />;
      case 'document': return <FileText size={16} />;
      default: return <LinkIcon size={16} />;
    }
  };

  // Group filtered materials by session
  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                        m.sessions?.topic.toLowerCase().includes(search.toLowerCase());
    const matchMonth = monthFilter === 'all' || m.sessions?.month_number.toString() === monthFilter;
    return matchSearch && matchMonth;
  });

  const grouped = filtered.reduce((acc, curr) => {
    const sessionId = curr.session_id;
    if (!acc[sessionId]) {
      acc[sessionId] = {
        session: curr.sessions,
        materials: []
      };
    }
    acc[sessionId].materials.push(curr);
    return acc;
  }, {});

  const sortedGroups = Object.values(grouped).sort((a, b) => new Date(b.session?.date) - new Date(a.session?.date));

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-500 pb-12 px-4 relative overflow-hidden">
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 border-b border-white/20 pb-12">
        <div className="space-y-4">

          <div>
            <h1 className="super-title text-text-primary flex items-center gap-4">

              Library Console
            </h1>
          </div>
          <p className="text-lg text-text-secondary max-w-xl font-medium leading-relaxed">
            Manage your module resources and sync learning assets.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary h-[64px] px-10 text-lg flex items-center gap-3 shadow-2xl shadow-primary-indigo/20"
        >
          <Plus size={24} /> New Material
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/30 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-sm">
        <div className="md:col-span-3 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary-indigo transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Search by module topic or file title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/60 border border-white/60 rounded-2xl pl-14 pr-6 h-[60px] text-text-primary text-[15px] font-black focus:bg-white focus:border-primary-indigo focus:shadow-2xl outline-none transition-all"
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary-indigo transition-colors" size={22} />
          <select 
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full bg-white/60 border border-white/60 rounded-2xl pl-14 pr-12 h-[60px] text-text-primary text-[15px] font-black focus:bg-white focus:border-primary-indigo outline-none appearance-none transition-all cursor-pointer shadow-sm"
          >
            <option value="all">Program Scope</option>
            {months.map(m => (
              <option key={m} value={m}>Module 0{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-plate h-64 animate-pulse"></div>
          ))}
        </div>
      ) : sortedGroups.length === 0 ? (
        <div className="text-center py-32 bg-white/30 backdrop-blur-md border-4 border-dashed border-white/60 rounded-[48px] shadow-inner space-y-6">
          <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center text-text-tertiary shadow-2xl mx-auto">
            <Layers size={64} className="opacity-20" />
          </div>
          <div>
            <h3 className="text-3xl font-display font-black text-text-primary">No assets found</h3>
            <p className="text-lg text-text-secondary font-medium">Try adjusting your filters to find existing materials.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sortedGroups.map((group, idx) => (
            <div key={idx} className="glass-plate group !p-0 overflow-hidden flex flex-col hover:border-primary-indigo/30 transform hover:-translate-y-2 transition-all duration-500">
              <div className="p-8 pb-6 bg-white/10 relative overflow-hidden">
                <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-primary-indigo/5 rounded-full blur-2xl group-hover:bg-primary-indigo/10 transition-all"></div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl text-[12px] font-black text-primary-indigo uppercase tracking-widest shadow-sm font-mono border border-primary-indigo/10">
                    <Calendar size={14} />
                    {new Date(group.session?.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-text-primary px-3 py-2 rounded-xl shadow-lg">
                    EXP-{group.session?.month_number}
                  </span>
                </div>

                <h3 className="text-[28px] font-display font-black text-text-primary mb-2 line-clamp-2 min-h-[72px] leading-[1.1] group-hover:text-primary-indigo transition-colors tracking-tighter">
                  {group.session?.topic}
                </h3>
              </div>
              
              <div className="flex-1 p-6 space-y-4 bg-white/30 backdrop-blur-md">
                {group.materials.map(m => (
                  <div key={m.id} className="relative group/item">
                    <motion.a 
                      whileHover={{ scale: 1.02, x: 8 }}
                      href={m.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-4 p-5 bg-white/60 border border-white/60 hover:border-primary-indigo hover:bg-white rounded-[24px] transition-all shadow-sm"
                    >
                      <div className={`p-4 rounded-2xl shadow-inner transition-transform group-hover/item:rotate-12 ${
                        m.type === 'recording' ? 'bg-rose-100 text-rose-500' : 
                        m.type === 'slides' ? 'bg-amber-100 text-amber-500' : 
                        'bg-sky-100 text-sky-500'
                      }`}>
                        {getIconForType(m.type)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[15px] font-black text-text-primary truncate group-hover/item:text-primary-indigo transition-colors">{m.title}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 px-2 py-0.5 rounded-full w-fit ${
                          m.type === 'recording' ? 'bg-rose-500/10 text-rose-600' : 
                          m.type === 'slides' ? 'bg-amber-500/10 text-amber-600' : 
                          'bg-sky-500/10 text-sky-600'
                        }`}>{m.type}</p>
                      </div>
                    </motion.a>
                    <button 
                      onClick={() => setDeletingId(m.id)}
                      className="absolute -right-2 -top-2 w-10 h-10 bg-white border border-border-default text-text-tertiary hover:text-danger hover:border-danger hover:rotate-90 rounded-full flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100 shadow-xl z-20"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Material"
        message="Are you sure you want to remove this material? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4">
          <div className="card-plate max-w-md w-full">
            <h3 className="text-h2 text-primary mb-6">Add Material</h3>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              
              <div>
                <label className="block text-label text-secondary uppercase tracking-widest mb-1">Session</label>
                <select required value={formSession} onChange={e=>setFormSession(e.target.value)} className="w-full bg-surface-inset border border-default rounded-md px-4 h-[44px] text-primary outline-none">
                  <option value="" disabled>Select a session</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{new Date(s.date).toLocaleDateString()} - {s.topic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-label text-secondary uppercase tracking-widest mb-1">Title</label>
                <input required type="text" value={formTitle} onChange={e=>setFormTitle(e.target.value)} placeholder="e.g. React State Slides" className="w-full bg-surface-inset border border-default rounded-md px-4 h-[44px] text-primary outline-none" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-label text-secondary uppercase tracking-widest mb-1">Type</label>
                  <select value={formType} onChange={e=>setFormType(e.target.value)} className="w-full bg-surface-inset border border-default rounded-md px-4 h-[44px] text-primary outline-none">
                    <option value="slides">Slides</option>
                    <option value="recording">Recording</option>
                    <option value="document">Document</option>
                    <option value="link">Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label text-secondary uppercase tracking-widest mb-1">URL</label>
                <input required type="url" value={formUrl} onChange={e=>setFormUrl(e.target.value)} placeholder="https://..." className="w-full bg-surface-inset border border-default rounded-md px-4 h-[44px] text-primary outline-none" />
              </div>

              <div>
                <label className="block text-label text-secondary uppercase tracking-widest mb-1">Description (Optional)</label>
                <input type="text" value={formDesc} onChange={e=>setFormDesc(e.target.value)} placeholder="Brief description..." className="w-full bg-surface-inset border border-default rounded-md px-4 h-[44px] text-primary outline-none" />
              </div>

              {formError && <p className="text-danger text-sm">{formError}</p>}

              <div className="flex gap-4 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-md font-medium text-secondary hover:text-primary transition-colors">
                  Cancel
                </button>
                <button disabled={saving} type="submit" className="px-5 py-2.5 rounded-md font-medium bg-fg-primary text-void hover:bg-[#E5E5E7] transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Material'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
