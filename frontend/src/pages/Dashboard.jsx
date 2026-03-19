import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User as UserIcon, Github, Linkedin, Trophy, Code2, Save, Bell, 
  ChevronRight, Activity, Edit3, X, MapPin, Calendar, Hash, Phone, 
  Building2, GraduationCap, Globe, ListChecks, LayoutDashboard, Menu
} from 'lucide-react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AnimatePresence, motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfileRoute = location.pathname.includes('/profile');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Student Name',
    githubLink: '',
    linkedinLink: '',
    projectShowcase: '',
    achievements: '',
    gender: '',
    dob: '',
    registrationNumber: '',
    phone: '',
    campus: '',
    batch: '',
    department: '',
    degree: ''
  });

  const [activeAssessments, setActiveAssessments] = useState([]);
  const [notifications, setNotifications] = useState(0);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({
          ...prev, ...data,
          name: data.name || data.email || 'Student Name'
        }));
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) setIsEditing(false);
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/assessments');
      if (res.ok) {
        const data = await res.json();
        setActiveAssessments(data);
      }
    } catch (e) {
      console.error('Failed to fetch assessments:', e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAssessments();

    const socket = new SockJS('http://localhost:8081/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/assessments', (message) => {
        if (message.body) {
          setNotifications(n => n + 1);
          fetchAssessments();
        }
      });
    });

    return () => {
      if (stompClient.connected) stompClient.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const renderField = (icon, label, name, placeholder = '', type = 'text') => (
    <div className="mb-4">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
        {icon} {label}
      </label>
      <input 
        type={type} 
        name={name}
        value={profile[name] || ''} 
        onChange={handleInputChange}
        placeholder={placeholder || `Enter ${label}`}
        disabled={!isEditing}
        className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
      >
        {isSidebarOpen ? <X size={24} className="text-slate-600"/> : <Menu size={24} className="text-slate-600"/>}
      </button>

      {/* Modern Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-72 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center p-8 border-b border-slate-100">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md relative">
            <UserIcon className="w-10 h-10 text-brand-700" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-brand-500 rounded-full border-2 border-white"></div>
          </div>
          <h2 className="text-[16px] font-black text-slate-800 truncate w-full text-center">{profile.name}</h2>
          <p className="text-brand-600 text-[10px] font-bold uppercase tracking-widest mt-1">Student Portal</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button onClick={() => {navigate('/dashboard'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${!isProfileRoute ? 'bg-brand-50/50 text-brand-700 border border-brand-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          <button onClick={() => {navigate('/profile'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isProfileRoute ? 'bg-brand-50/50 text-brand-700 border border-brand-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <UserIcon size={20} /> My Profile
          </button>
          
          <div className="pt-6 mt-6 border-t border-slate-100">
             <button onClick={() => {navigate('/login'); setIsSidebarOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
               <X size={20} /> Sign Out
             </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Header Area */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isProfileRoute ? 'Profile Settings' : `Welcome back!`}
            </h1>
            <p className="text-slate-500 mt-1 font-medium tracking-wide">
              {isProfileRoute ? 'Update your personal and academic info' : 'Ready to ace your next assessment?'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer" onClick={() => setNotifications(0)}>
              <Bell className="w-6 h-6 text-slate-400 hover:text-brand-600 transition-colors" />
              <AnimatePresence>
                {notifications > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md"
                  >
                    {notifications}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* DASHBOARD VIEW */}
        {!isProfileRoute && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-bl-full blur-3xl pointer-events-none"></div>
            
            <h3 className="flex items-center gap-3 text-xl font-extrabold text-brand-700 mb-8 uppercase tracking-wider relative z-10">
              <Activity className="w-6 h-6" /> Pending Assessments
            </h3>
            
            {activeAssessments.length === 0 ? (
              <div className="text-slate-500 p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <Code2 className="w-16 h-16 text-slate-300 mb-4"/>
                <p className="font-bold text-lg text-slate-700">You are all caught up!</p>
                <p className="text-sm mt-2 text-slate-500">Wait for your instructors to assign new challenges.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <AnimatePresence>
                  {activeAssessments.map((assessment) => (
                    <motion.div 
                      key={assessment.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-brand-400 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => navigate(`/assessment/${assessment.id}`)}
                    >
                      <div className="mb-6">
                        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                          {assessment.type === 'QUIZ' ? <ListChecks size={24} /> : <Code2 size={24} />}
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{assessment.title}</h4>
                        <div className="text-xs text-slate-500 flex flex-col gap-2 font-bold tracking-wider uppercase mt-4">
                           <span className="inline-block px-3 py-1 rounded bg-slate-100 self-start">{assessment.type}</span>
                           <span>⏳ {assessment.durationMinutes || 60} MINS</span>
                           <span>🎯 {assessment.totalPoints || 0} PTS</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-brand-600 font-bold text-sm">
                        <span>Launch Session</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* PROFILE VIEW */}
        {isProfileRoute && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
               <div>
                 <h2 className="text-2xl font-black text-slate-800">My Information</h2>
                 <p className="text-sm text-slate-500 mt-1 font-medium">Please keep your details up to date</p>
               </div>
               {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl font-bold flex items-center gap-2 border border-brand-200 transition-colors">
                   <Edit3 size={18} /> Edit Mode
                 </button>
               ) : (
                 <button onClick={saveProfile} className="px-6 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all transform hover:-translate-y-0.5">
                   <Save size={18} /> Save Changes
                 </button>
               )}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Contact Block */}
               <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <UserIcon className="text-brand-500" size={18} /> Basic Details
                  </h3>
                  <div className="space-y-2">
                    {renderField(<UserIcon size={16} className="text-slate-400" />, 'Full Name', 'name')}
                    {renderField(<Calendar size={16} className="text-slate-400" />, 'Date of Birth', 'dob', 'YYYY-MM-DD', 'date')}
                    {renderField(<UserIcon size={16} className="text-slate-400" />, 'Gender', 'gender', 'Male/Female/Other')}
                    {renderField(<Phone size={16} className="text-slate-400" />, 'Phone', 'phone', '+1 234 567 890')}
                  </div>
               </div>
               
               {/* Academic Block */}
               <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <GraduationCap className="text-brand-500" size={18} /> Academics
                  </h3>
                  <div className="space-y-2">
                    {renderField(<Hash size={16} className="text-slate-400" />, 'Registration No.', 'registrationNumber')}
                    {renderField(<MapPin size={16} className="text-slate-400" />, 'Campus', 'campus')}
                    {renderField(<Building2 size={16} className="text-slate-400" />, 'Department', 'department')}
                    {renderField(<GraduationCap size={16} className="text-slate-400" />, 'Degree Context', 'degree')}
                    {renderField(<Calendar size={16} className="text-slate-400" />, 'Batch/Year', 'batch')}
                  </div>
               </div>

               {/* Professional Block */}
               <div className="lg:col-span-2 border-t border-slate-100 pt-8 mt-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Globe className="text-brand-500" size={18} /> Online Presence & Portfolio
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      {renderField(<Github size={16} className="text-slate-400" />, 'GitHub URL', 'githubLink')}
                      {renderField(<Linkedin size={16} className="text-slate-400" />, 'LinkedIn URL', 'linkedinLink')}
                      <div className="mt-6">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                          <Trophy size={14} className="text-brand-500" /> Achievements
                        </label>
                        <textarea 
                          name="achievements"
                          disabled={!isEditing}
                          className="w-full h-32 bg-white border border-slate-200 text-slate-800 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-brand-500 transition-all shadow-sm resize-none disabled:bg-slate-50 disabled:text-slate-500"
                          value={profile.achievements || ''}
                          onChange={handleInputChange}
                          placeholder="Awards, hackathon wins, competitive programming ranks..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Code2 size={14} className="text-brand-500" /> Project Showcase
                      </label>
                      <textarea 
                        name="projectShowcase"
                        disabled={!isEditing}
                        className="w-full h-48 bg-white border border-slate-200 text-slate-800 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-brand-500 transition-all shadow-sm resize-none disabled:bg-slate-50 disabled:text-slate-500"
                        value={profile.projectShowcase || ''}
                        onChange={handleInputChange}
                        placeholder="List your best projects and their tech stacks..."
                      />
                    </div>
                  </div>
               </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}
