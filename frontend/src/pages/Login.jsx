import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState('mentor');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();
  
  // Antigravity Cursor Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 300 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let email = identifier;
    if (activeTab === 'student') {
      email = `${identifier}@forge.local`;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (activeTab === 'student' && password === identifier) {
        setNeedsPasswordChange(true);
        setLoading(false);
        return;
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userProfile?.role === 'mentor') {
        navigate('/dashboard');
      } else {
        navigate('/me/attendance');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;
      navigate('/me/attendance');
    } catch (err) {
      setError(err.message || 'Failed to update password');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row relative overflow-hidden bg-[#FDFDFF] font-display select-none">
      
      {/* Background Liquid Layer */}
      <div className="absolute inset-0 -z-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-[#E8D1FF]/30 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-[#D1E8FF]/30 rounded-full blur-[180px]"></div>
      </div>

      {/* Cursor Glow */}
      <motion.div 
        style={{ x: cursorX, y: cursorY }}
        className="fixed pointer-events-none w-[600px] h-[600px] bg-primary-indigo/10 rounded-full blur-[120px] -z-10 -translate-x-1/2 -translate-y-1/2"
      />

      {/* LEFT SECTION: Branding & Visuals (60%) */}
      <div className="hidden md:flex flex-[1.5] flex-col p-20 justify-between relative overflow-hidden">
        <div className="z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="w-14 h-14 bg-primary-indigo rounded-2xl flex items-center justify-center shadow-2xl">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-black text-text-primary tracking-tighter">ForgeTrack</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl"
          >
            <h1 className="text-[120px] font-black text-text-primary leading-[0.85] tracking-tighter mb-8">
              MASTER <br /> <span className="text-primary-indigo">PROGRESS.</span>
            </h1>
            <p className="text-xl text-text-secondary font-medium tracking-tight opacity-70 max-w-md">
              The next generation scholarly ecosystem for tracking attendance, learning assets, and academic trajectory.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute right-0 bottom-0 w-[80%] opacity-20 pointer-events-none"
        >
          <img 
            src="/brain/5c9ed43b-af94-41c0-b596-91f80f81f8f4/university_campus_silhouette_1778083249692.png" 
            alt="University" 
            className="w-full h-auto grayscale translate-x-20 translate-y-20"
          />
        </motion.div>

        <div className="z-10 flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">
          <span>Secure Authentication</span>
          <span>Version 2.4.0</span>
          <span>© 2026 KineticForge</span>
        </div>
      </div>

      {/* RIGHT SECTION: Login Form (40%) */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20 z-20">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[480px] glass-plate !bg-white/40 backdrop-blur-[120px] border border-white p-12 md:p-16 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.1)] rounded-[56px]"
        >
          <div className="mb-12">
            <h3 className="text-3xl font-black text-text-primary tracking-tighter mb-2">Welcome back</h3>
            <p className="text-text-secondary font-medium tracking-tight opacity-60">Enter your credentials to access your node.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-black/5 p-1 rounded-2xl mb-10 relative">
            <button 
              onClick={() => setActiveTab('mentor')}
              className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'mentor' ? 'text-primary-indigo' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Mentor
            </button>
            <button 
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'student' ? 'text-primary-indigo' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Student
            </button>
            <motion.div 
              layoutId="activeTab"
              animate={{ x: activeTab === 'mentor' ? '0%' : '100%' }}
              className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-lg shadow-black/5 z-0"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (needsPasswordChange ? '-reset' : '-login')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {needsPasswordChange ? (
                <form onSubmit={handlePasswordChange} className="space-y-8">
                  <div className="relative group border-b-2 border-border-default focus-within:border-primary-indigo transition-all pb-3">
                    <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1.5">New Security Key</label>
                    <input 
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-transparent text-text-primary outline-none text-xl font-black placeholder:text-text-tertiary/10"
                      placeholder="••••••••"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 bg-primary-indigo text-white rounded-[24px] font-black text-xs uppercase tracking-[0.25em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary-indigo/30"
                  >
                    {loading ? 'Saving...' : 'Set Security Key'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-8">
                  <div className="space-y-8">
                    <div className="relative group border-b-2 border-border-default focus-within:border-primary-indigo transition-all pb-3">
                      <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1.5">
                        {activeTab === 'mentor' ? 'Corporate ID' : 'Academic USN'}
                      </label>
                      <input 
                        type={activeTab === 'mentor' ? 'email' : 'text'}
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-transparent text-text-primary outline-none text-xl font-black placeholder:text-text-tertiary/10 h-10"
                        placeholder={activeTab === 'mentor' ? "mentor@forge.track" : "4SH24CS001"}
                      />
                      <Mail className="absolute right-0 bottom-4 text-text-tertiary/20" size={18} />
                    </div>

                    <div className="relative group border-b-2 border-border-default focus-within:border-primary-indigo transition-all pb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Security Key</label>
                        <button type="button" className="text-[10px] font-black text-primary-indigo hover:underline tracking-widest uppercase">Forgot?</button>
                      </div>
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-text-primary outline-none text-xl font-black placeholder:text-text-tertiary/10 h-10"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute right-0 bottom-4 text-text-tertiary/20" size={18} />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 bg-primary-indigo text-white rounded-[24px] font-black text-xs uppercase tracking-[0.25em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary-indigo/30"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </button>

                  {error && (
                    <p className="text-red-500 text-[10px] text-center font-black uppercase tracking-[0.2em]">{error}</p>
                  )}
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="mt-12 text-center text-[11px] text-text-tertiary font-bold tracking-tight">
            Protected by ForgeTrack Shield v2.4
          </p>
        </motion.div>
      </div>

      {/* Full Screen Background Texture */}
      <div className="absolute inset-0 -z-40 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#5D5FEF 1px, transparent 1px)', backgroundSize: '64px 64px' }}></div>
    </div>
  );
}
