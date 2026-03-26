import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User as UserIcon, Github, Linkedin, Trophy, Code2, Save, Bell, 
  ChevronRight, Activity, Edit3, X, Calendar, Hash, Phone, 
  Building2, Globe, ListChecks, LayoutDashboard, Menu, PlusCircle, Trash2, ArrowLeft, ArrowRight, RefreshCw
} from 'lucide-react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AnimatePresence, motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfileRoute = location.pathname.includes('/profile');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: '',
    githubLink: '',
    linkedinLink: '',
    leetcodeLink: '',
    gender: '',
    dob: '',
    registrationNumber: '',
    phone: '',
    batch: '',
    department: '',
    projectShowcase: '',
    achievements: ''
  });

  const [activeAssessments, setActiveAssessments] = useState([]);
  const [notifications, setNotifications] = useState(0);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/profile', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          fullName: data.fullName || '',
          githubLink: data.githubLink || '',
          linkedinLink: data.linkedinLink || '',
          leetcodeLink: data.leetcodeLink || '',
          gender: data.gender || '',
          dob: data.dob || '',
          registrationNumber: data.registrationNumber || '',
          phone: data.phone || '',
          batch: data.batch || '',
          department: data.department || '',
          projectShowcase: data.projectShowcase || '',
          achievements: data.achievements || ''
        });
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    }
  };

  const saveProfile = async () => {
    try {
      const payload = {
        ...profile
      };

      const res = await fetch('http://localhost:8081/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
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
    } catch (e) { }
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchProfile();
    fetchAssessments();

    // Ticking clock for live timers
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

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
      clearInterval(timer);
      if (stompClient.connected) stompClient.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };



  const renderField = (icon, label, name, type = 'text') => {
    const isTextArea = type === 'textarea';
    const IconCmp = () => React.cloneElement(icon, { strokeWidth: 1.5, className: 'w-4 h-4 mr-1 text-indigo-500' });
    
    return (
      <div className="premium-input-container relative mb-5 group">
        {isTextArea ? (
          <textarea 
            name={name}
            id={name}
            value={profile[name] || ''} 
            onChange={handleInputChange}
            placeholder=" "
            disabled={!isEditing}
            rows={4}
            className="premium-input block px-4 pb-2.5 pt-6 w-full text-sm disabled:opacity-50 disabled:bg-slate-50 peer placeholder-transparent"
          />
        ) : (
          <input 
            type={type} 
            name={name}
            id={name}
            value={profile[name] || ''} 
            onChange={handleInputChange}
            placeholder=" "
            disabled={!isEditing}
            className="premium-input block px-4 pb-2.5 pt-6 w-full text-sm disabled:opacity-50 disabled:bg-slate-50 peer placeholder-transparent"
          />
        )}
        <label 
          htmlFor={name}
          className="absolute text-sm text-slate-400 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 flex items-center font-medium"
        >
          {icon && React.cloneElement(icon, { strokeWidth: 1.5, className: 'w-4 h-4 mr-1.5' })} {label}
        </label>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Slim Collapsible Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-y-0 left-0 z-40 md:static flex flex-col shrink-0 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 16px 0 rgba(99,102,241,0.07), 1px 0 0 0 #e2e8f0'
        }}
      >
        {/* ── Sidebar Header (logo + toggle) ── */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
              <Code2 className="text-white" size={20} strokeWidth={1.5} />
            </div>
            <motion.span
              animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="font-extrabold text-lg tracking-tight text-slate-800 whitespace-nowrap overflow-hidden"
            >
              AssessHub
            </motion.span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── User Avatar strip ── */}
        <div className="flex items-center justify-center py-4 border-b border-slate-100 shrink-0">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm shrink-0 relative">
            <UserIcon className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
          </div>
          <motion.span
            animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="ml-3 text-sm font-bold text-slate-800 truncate overflow-hidden whitespace-nowrap"
          >
            {profile.fullName || 'Student Portal'}
          </motion.span>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {[
            { path: '/dashboard',  Icon: LayoutDashboard, label: 'Dashboard',  active: !isProfileRoute },
            { path: '/profile',    Icon: UserIcon,         label: 'My Profile', active: isProfileRoute },
          ].map(({ path, Icon, label, active }) => (
            <button
              key={path}
              onClick={() => { navigate(path); setIsSidebarOpen(false); }}
              title={!isSidebarOpen ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              } ${!isSidebarOpen ? 'justify-center' : ''}`}
            >
              <Icon size={20} className="shrink-0" strokeWidth={1.5} />
              <motion.span
                animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="whitespace-nowrap overflow-hidden text-sm"
              >
                {label}
              </motion.span>
            </button>
          ))}
        </nav>

        {/* ── Sign Out ── */}
        <div className="px-2 py-3 border-t border-slate-100 shrink-0">
          <button
            onClick={() => { navigate('/login'); setIsSidebarOpen(false); }}
            title={!isSidebarOpen ? 'Sign Out' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-rose-500 hover:bg-rose-50 transition-colors duration-150 ${
              !isSidebarOpen ? 'justify-center' : ''
            }`}
          >
            <X size={20} className="shrink-0" strokeWidth={1.5} />
            <motion.span
              animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="whitespace-nowrap overflow-hidden text-sm"
            >
              Sign Out
            </motion.span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar Header */}
        <header className="flex items-center justify-between px-8 py-4 glass-panel border-b border-slate-200 z-10 m-4 mb-0 rounded-2xl">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
            <button onClick={() => window.location.reload()} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <RefreshCw size={18} strokeWidth={1.5} />
            </button>
            {/* Mobile hamburger in header */}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              <Menu size={18} strokeWidth={1.5} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 ml-2">
              {isProfileRoute ? 'Profile Settings' : 'Overview'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" onClick={() => setNotifications(0)}>
              <Bell className="w-6 h-6" strokeWidth={1.5} />
              <AnimatePresence>
                {notifications > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm"
                  >
                    {notifications}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">

            {/* DASHBOARD VIEW */}
            {!isProfileRoute && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 relative overflow-hidden min-h-[500px]"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] pointer-events-none opacity-60"></div>
                
                <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-8 tracking-tight relative z-10">
                  <Activity className="w-6 h-6 text-indigo-500" strokeWidth={1.5} /> Active Assignments
                </h3>
                
                {activeAssessments.length === 0 ? (
                  <div className="text-slate-500 p-12 glass-panel border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                    <Code2 className="w-16 h-16 text-indigo-300 mb-4" strokeWidth={1.5}/>
                    <p className="font-semibold text-lg text-slate-700">You are all caught up!</p>
                    <p className="text-sm mt-1 text-slate-500">Wait for your instructors to assign new challenges.</p>
                  </div>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10"
                  >
                    {[...activeAssessments].sort((a, b) => {
                       const isAClosed = a.endTime ? new Date(a.endTime) < currentTime : false;
                       const isBClosed = b.endTime ? new Date(b.endTime) < currentTime : false;
                       if (isAClosed === isBClosed) return 0;
                       return isAClosed ? 1 : -1;
                    }).map((assessment) => {
                      const startTime = assessment.startTime ? new Date(assessment.startTime) : null;
                      const endTime = assessment.endTime ? new Date(assessment.endTime) : null;
                      
                      const isNotStarted = startTime && startTime > currentTime;
                      const isClosed = endTime && endTime < currentTime;
                      
                      const getTimeRemaining = (targetDate) => {
                        const diff = targetDate - currentTime;
                        if (diff <= 0) return "00:00:00";
                        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                        return `${h}:${m}:${s}`;
                      };

                      const isSignedUp = profile?.email && assessment.signedUpUsers?.includes(profile.email);

                      const handleClick = async () => {
                          if (isClosed) return;
                          if (!isNotStarted && !isSignedUp) {
                             try {
                                const token = sessionStorage.getItem('token');
                                await fetch(`http://localhost:8081/api/v1/assessments/${assessment.id}/signup`, {
                                    method: 'POST',
                                    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
                                });
                                fetchAssessments();
                             } catch(e) { console.error(e); }
                          } else {
                             navigate(`/assessment/${assessment.id}`);
                          }
                      };

                      return (
                        <motion.div 
                          variants={itemVariants}
                          key={assessment.id} 
                          className={`glass-panel p-6 flex flex-col justify-between transition-all relative group ${
                            isClosed 
                            ? 'opacity-60 bg-slate-50 cursor-not-allowed border-slate-200' 
                            : isNotStarted 
                              ? 'border-indigo-100 hover:border-indigo-300 cursor-pointer bg-white'
                              : 'border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer bg-white'
                          }`}
                          onClick={handleClick}
                        >
                          <div className="mb-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                                isClosed 
                                ? 'bg-slate-100 text-slate-400' 
                                : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                              }`}>
                                {assessment.type === 'QUIZ' ? <ListChecks size={24} strokeWidth={1.5} /> : <Code2 size={24} strokeWidth={1.5} />}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                                isClosed 
                                ? 'bg-rose-50 border-rose-100 text-rose-600' 
                                : isNotStarted
                                  ? 'bg-amber-50 border-amber-100 text-amber-600'
                                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                              }`}>
                                {isClosed ? 'Closed' : isNotStarted ? 'Upcoming' : 'Open'}
                              </span>
                            </div>
                            
                            <h4 className="text-lg font-bold text-slate-800 line-clamp-1 mb-3">{assessment.title}</h4>

                            <div className="flex flex-wrap gap-2">
                               <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wide border border-transparent">{assessment.type}</span>
                               <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1 border border-transparent">
                                 {isClosed ? 'Expired' : isNotStarted ? `Starts: ${getTimeRemaining(startTime)}` : `Ends: ${getTimeRemaining(endTime)}`}
                               </span>
                               <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-transparent">🎯 {assessment.totalPoints || 0} pts</span>
                            </div>
                          </div>

                          <div className={`pt-4 border-t border-slate-100 flex items-center justify-between font-bold text-xs uppercase tracking-widest ${
                            isClosed ? 'text-slate-400' : isNotStarted ? 'text-amber-500' : 'text-indigo-600'
                          }`}>
                            <span>{isClosed ? 'Time Expired' : isNotStarted ? 'Enter Waiting Room' : (!isSignedUp ? 'Sign Up' : (assessment.type === 'QUIZ' ? 'Enter Quiz' : 'Enter Contest'))}</span>
                            {!isClosed && <ChevronRight size={20} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* PROFILE VIEW */}
            {isProfileRoute && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 relative overflow-hidden"
              >
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                   <div>
                     <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Information</h2>
                     <p className="text-sm text-slate-500 mt-1">Manage your personal and integrated platform details</p>
                   </div>
                   {!isEditing ? (
                     <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 border border-slate-200 transition-colors shadow-sm">
                       <Edit3 size={16} strokeWidth={1.5} /> Edit Profile
                     </button>
                   ) : (
                     <div className="flex gap-3">
                       <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="px-5 py-2.5 bg-white text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 border border-slate-200 transition-colors">
                         Cancel
                       </button>
                       <button onClick={saveProfile} className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                         <Save size={16} strokeWidth={1.5} /> Save Changes
                       </button>
                     </div>
                   )}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                   {/* Contact Block */}
                   <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <UserIcon className="text-indigo-500" size={16} strokeWidth={2} /> Basics
                      </h3>
                      <div className="space-y-1">
                        {renderField(<UserIcon />, 'Full Name', 'fullName')}
                        {renderField(<Calendar />, 'Date of Birth', 'dob', 'date')}
                        {renderField(<UserIcon />, 'Gender', 'gender')}
                        {renderField(<Phone />, 'Phone Number', 'phone')}
                      </div>
                   </div>
                   
                   {/* Academic Block */}
                   <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Building2 className="text-indigo-500" size={16} strokeWidth={2} /> Academics
                      </h3>
                      <div className="space-y-1">
                        {renderField(<Hash />, 'Registration No.', 'registrationNumber')}
                        {renderField(<Building2 />, 'Department', 'department')}
                        {renderField(<Calendar />, 'Batch/Year', 'batch')}
                      </div>
                   </div>

                   {/* Professional Block */}
                   <div className="lg:col-span-2 border-t border-slate-100 pt-8 mt-2">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Globe className="text-indigo-500" size={16} strokeWidth={2} /> Links & Portfolio
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                        <div className="space-y-1">
                          {renderField(<Github />, 'GitHub Profile', 'githubLink')}
                          {renderField(<Linkedin />, 'LinkedIn Profile', 'linkedinLink')}
                          {renderField(<Code2 />, 'LeetCode Profile', 'leetcodeLink')}
                          
                          <div className="mt-4">
                            {renderField(<Trophy />, 'Key Achievements', 'achievements', 'textarea')}
                          </div>
                        </div>
                        
                        <div>
                          {renderField(<Globe />, 'Project Showcase', 'projectShowcase', 'textarea')}
                        </div>
                      </div>
                   </div>
                 </div>
              </motion.div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
