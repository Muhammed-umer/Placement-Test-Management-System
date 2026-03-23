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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    department: ''
  });

  const [projectsArray, setProjectsArray] = useState([]);
  const [achievementsArray, setAchievementsArray] = useState([]);

  const [newProject, setNewProject] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const [activeAssessments, setActiveAssessments] = useState([]);
  const [notifications, setNotifications] = useState(0);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
          department: data.department || ''
        });
        
        try { setProjectsArray(JSON.parse(data.projectShowcase || '[]')); } catch(e) { setProjectsArray([]); }
        try { setAchievementsArray(JSON.parse(data.achievements || '[]')); } catch(e) { setAchievementsArray([]); }
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    }
  };

  const saveProfile = async () => {
    try {
      const payload = {
        ...profile,
        projectShowcase: JSON.stringify(projectsArray),
        achievements: JSON.stringify(achievementsArray)
      };

      const res = await fetch('http://localhost:8081/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const addProject = () => {
    if (newProject.trim()) {
      setProjectsArray([...projectsArray, newProject.trim()]);
      setNewProject('');
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievementsArray([...achievementsArray, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const removeProject = (idx) => {
    setProjectsArray(projectsArray.filter((_, i) => i !== idx));
  };

  const removeAchievement = (idx) => {
    setAchievementsArray(achievementsArray.filter((_, i) => i !== idx));
  };

  const renderField = (icon, label, name, placeholder = '', type = 'text') => (
    <div className="mb-4">
      <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-widest flex items-center gap-2 mb-2">
        {icon} {label}
      </label>
      <input 
        type={type} 
        name={name}
        value={profile[name] || ''} 
        onChange={handleInputChange}
        placeholder={placeholder || `Enter ${label}`}
        disabled={!isEditing}
        className="w-full bg-[#FFFFFF] border-2 border-[#4CAF50] text-[#2C3E50] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#007ACC] focus:ring-4 focus:ring-[#4CAF50]/30 transition-all shadow-sm disabled:opacity-50 disabled:bg-[#F4F4F4]"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F4F4] text-[#2C3E50] font-sans">
      
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#FFFFFF] rounded-lg shadow-md border-2 border-[#4CAF50]"
      >
        {isSidebarOpen ? <X size={24} className="text-[#2C3E50]"/> : <Menu size={24} className="text-[#2C3E50]"/>}
      </button>

      {/* Modern Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#FFFFFF] border-r-4 border-[#4CAF50] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-72 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-center gap-4 py-4 border-b-4 border-[#F4F4F4] bg-white z-10 sticky top-0">
           <button onClick={() => window.history.back()} className="p-2.5 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm border border-[#4CAF50]" title="Go Back">
              <ArrowLeft size={18} />
           </button>
           <button onClick={() => window.location.reload()} className="p-2.5 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm border border-[#4CAF50]" title="Refresh">
              <RefreshCw size={18} />
           </button>
           <button onClick={() => window.history.forward()} className="p-2.5 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm border border-[#4CAF50]" title="Go Forward">
              <ArrowRight size={18} />
           </button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 border-b-2 border-[#F4F4F4]">
          <div className="w-20 h-20 bg-[#4CAF50] rounded-full flex items-center justify-center mb-4 border-4 border-[#007ACC] shadow-md relative">
            <UserIcon className="w-10 h-10 text-[#2C3E50]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#F0A500] rounded-full border-2 border-[#FFFFFF]"></div>
          </div>
          <h2 className="text-[16px] font-black text-[#2C3E50] truncate w-full text-center">{profile.fullName || 'Student Portal'}</h2>
        </div>

        <nav className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
          <button onClick={() => {navigate('/dashboard'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${!isProfileRoute ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          <button onClick={() => {navigate('/profile'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isProfileRoute ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
            <UserIcon size={20} /> My Profile
          </button>
          
          <div className="pt-6 mt-6 border-t-2 border-[#F4F4F4]">
             <button onClick={() => {navigate('/login'); setIsSidebarOpen(false);}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors">
               <X size={20} /> Sign Out
             </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Header Area */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-[#FFFFFF] p-6 rounded-2xl border-2 border-[#4CAF50] shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2C3E50] tracking-tight">
              {isProfileRoute ? 'Profile Settings' : `Welcome back!`}
            </h1>
            <p className="text-[#2C3E50]/70 mt-1 font-medium tracking-wide">
              {isProfileRoute ? 'Update your personal and academic info' : 'Ready to ace your next assessment?'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer" onClick={() => setNotifications(0)}>
              <Bell className="w-8 h-8 text-[#007ACC] hover:text-[#F0A500] transition-colors" />
              <AnimatePresence>
                {notifications > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-[#007ACC] text-[#2C3E50] text-[12px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-md"
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
          <div className="bg-[#FFFFFF] rounded-3xl p-8 border-2 border-[#4CAF50] shadow-sm relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4F4F4] rounded-bl-full blur-3xl pointer-events-none"></div>
            
            <h3 className="flex items-center gap-3 text-2xl font-black text-[#2C3E50] mb-8 uppercase tracking-wider relative z-10">
              <Activity className="w-8 h-8 text-[#007ACC]" /> Pending Assessments
            </h3>
            
            {activeAssessments.length === 0 ? (
              <div className="text-[#2C3E50] p-12 bg-[#F4F4F4] rounded-2xl border-4 border-dashed border-[#4CAF50] flex flex-col items-center justify-center text-center">
                <Code2 className="w-20 h-20 text-[#007ACC] mb-4"/>
                <p className="font-black text-xl text-[#2C3E50]">You are all caught up!</p>
                <p className="text-md mt-2 text-[#2C3E50]/70">Wait for your instructors to assign new challenges.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <AnimatePresence>
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

                    return (
                      <motion.div 
                        key={assessment.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-[#FFFFFF] rounded-2xl border-2 p-6 flex flex-col justify-between transition-all relative group ${
                          isClosed 
                          ? 'border-gray-200 opacity-75 grayscale-[0.5] cursor-not-allowed' 
                          : isNotStarted 
                            ? 'border-brand-100 opacity-90 cursor-pointer'
                            : 'border-[#4CAF50] hover:border-[#007ACC] hover:shadow-xl hover:shadow-[#007ACC]/20 cursor-pointer'
                        }`}
                        onClick={() => !isClosed && navigate(`/assessment/${assessment.id}`)}
                      >
                        <div className="mb-6">
                          <div className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                            isClosed 
                            ? 'bg-gray-100 border-gray-300 text-gray-400' 
                            : isNotStarted
                              ? 'bg-brand-50 border-brand-200 text-brand-400'
                              : 'bg-[#F4F4F4] border-[#4CAF50] text-[#007ACC] group-hover:bg-[#007ACC] group-hover:text-[#FFFFFF]'
                          }`}>
                            {assessment.type === 'QUIZ' ? <ListChecks size={32} /> : <Code2 size={32} />}
                          </div>
                          
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-black text-[#2C3E50] line-clamp-1">{assessment.title}</h4>
                            <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border-2 ${
                              isClosed 
                              ? 'bg-red-50 border-red-200 text-red-500' 
                              : isNotStarted
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'bg-green-50 border-green-200 text-green-600'
                            }`}>
                              {isClosed ? 'Closed' : isNotStarted ? 'Upcoming' : 'Open'}
                            </span>
                          </div>

                          <div className="text-xs text-[#2C3E50] flex flex-wrap gap-2 font-bold tracking-wider uppercase mt-4">
                             <span className={`inline-block px-4 py-2 rounded-lg border self-start ${isClosed ? 'bg-gray-100 border-gray-200' : 'bg-[#F4F4F4] border-[#4CAF50]'}`}>{assessment.type}</span>
                             <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#F4F4F4] border border-[#F4F4F4] text-[#2C3E50]">
                               {isClosed ? 'Expired' : isNotStarted ? `Starts In: ${getTimeRemaining(startTime)}` : `Time Left: ${getTimeRemaining(endTime)}`}
                             </span>
                             <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#F4F4F4] border border-[#F4F4F4]">🎯 {assessment.totalPoints || 0} PTS</span>
                          </div>
                        </div>

                        <div className={`pt-4 border-t-2 border-[#F4F4F4] flex items-center justify-between font-black text-sm uppercase tracking-widest ${
                          isClosed ? 'text-gray-400' : isNotStarted ? 'text-amber-500' : 'text-[#007ACC]'
                        }`}>
                          <span>{isClosed ? 'Time Expired' : isNotStarted ? 'Enter Waiting Room' : 'Launch Session'}</span>
                          {!isClosed && <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* PROFILE VIEW */}
        {isProfileRoute && (
          <div className="bg-[#FFFFFF] rounded-3xl p-8 border-2 border-[#4CAF50] shadow-sm relative overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b-2 border-[#F4F4F4]">
               <div>
                 <h2 className="text-3xl font-black text-[#2C3E50]">My Information</h2>
                 <p className="text-md text-[#2C3E50]/70 mt-1 font-medium">Please keep your details up to date</p>
               </div>
               {!isEditing ? (
                 <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#4CAF50] rounded-xl font-black uppercase tracking-wider flex items-center gap-3 border-2 border-[#007ACC] transition-colors">
                   <Edit3 size={20} /> Enable Edit Mode
                 </button>
               ) : (
                 <div className="flex gap-4">
                   <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-black uppercase tracking-wider flex items-center gap-3 border-2 border-red-200 transition-colors">
                     <X size={20} /> Cancel
                   </button>
                   <button onClick={saveProfile} className="px-6 py-3 bg-[#007ACC] text-[#2C3E50] hover:bg-[#F0A500] rounded-xl font-black uppercase tracking-wider flex items-center gap-3 shadow-lg shadow-[#007ACC]/30 transition-all transform hover:-translate-y-1">
                     <Save size={20} /> Save Changes
                   </button>
                 </div>
               )}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Contact Block */}
               <div>
                  <h3 className="text-sm font-black text-[#2C3E50] uppercase tracking-widest mb-6 flex items-center gap-3 p-3 bg-[#F4F4F4] rounded-xl border-l-4 border-[#007ACC]">
                    <UserIcon className="text-[#007ACC]" size={20} /> Basic Details
                  </h3>
                  <div className="space-y-4">
                    {renderField(<UserIcon size={16} className="text-[#007ACC]" />, 'Full Name', 'fullName')}
                    {renderField(<Calendar size={16} className="text-[#007ACC]" />, 'Date of Birth', 'dob', 'YYYY-MM-DD', 'date')}
                    {renderField(<UserIcon size={16} className="text-[#007ACC]" />, 'Gender', 'gender', 'Male/Female/Other')}
                    {renderField(<Phone size={16} className="text-[#007ACC]" />, 'Phone Number', 'phone', '+1 234 567 890')}
                  </div>
               </div>
               
               {/* Academic Block */}
               <div>
                  <h3 className="text-sm font-black text-[#2C3E50] uppercase tracking-widest mb-6 flex items-center gap-3 p-3 bg-[#F4F4F4] rounded-xl border-l-4 border-[#007ACC]">
                    <Building2 className="text-[#007ACC]" size={20} /> Academics
                  </h3>
                  <div className="space-y-4">
                    {renderField(<Hash size={16} className="text-[#007ACC]" />, 'Registration No.', 'registrationNumber')}
                    {renderField(<Building2 size={16} className="text-[#007ACC]" />, 'Department', 'department')}
                    {renderField(<Calendar size={16} className="text-[#007ACC]" />, 'Batch/Year', 'batch')}
                  </div>
               </div>

               {/* Professional Block */}
               <div className="lg:col-span-2 border-t-4 border-[#F4F4F4] pt-10 mt-4">
                  <h3 className="text-sm font-black text-[#2C3E50] uppercase tracking-widest mb-8 flex items-center gap-3 p-3 bg-[#F4F4F4] rounded-xl border-l-4 border-[#007ACC]">
                    <Globe className="text-[#007ACC]" size={20} /> Online Presence & Portfolio
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {renderField(<Github size={16} className="text-[#007ACC]" />, 'GitHub URL', 'githubLink')}
                      {renderField(<Linkedin size={16} className="text-[#007ACC]" />, 'LinkedIn URL', 'linkedinLink')}
                      {renderField(<Code2 size={16} className="text-[#007ACC]" />, 'LeetCode Profile', 'leetcodeLink')}
                      
                      {/* Achievements List */}
                      <div className="mt-8">
                        <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-widest flex items-center gap-2 mb-4">
                          <Trophy size={16} className="text-[#007ACC]" /> Achievements
                        </label>
                        {isEditing && (
                          <div className="flex gap-2 mb-4">
                            <input 
                              type="text" 
                              value={newAchievement} 
                              onChange={(e) => setNewAchievement(e.target.value)}
                              placeholder="Add an achievement..." 
                              className="flex-1 bg-[#FFFFFF] border-2 border-[#4CAF50] text-[#2C3E50] rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#007ACC]"
                            />
                            <button onClick={addAchievement} className="bg-[#007ACC] text-[#2C3E50] p-3 rounded-xl hover:bg-[#F0A500] transition-colors"><PlusCircle size={20} /></button>
                          </div>
                        )}
                        <ul className="space-y-3">
                          {achievementsArray.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-[#F4F4F4] border border-[#4CAF50] p-3 rounded-xl text-sm font-bold">
                              <span>🏆 {item}</span>
                              {isEditing && <button onClick={() => removeAchievement(idx)} className="text-red-500 hover:text-red-700 bg-white p-2 rounded-lg"><Trash2 size={16} /></button>}
                            </li>
                          ))}
                          {achievementsArray.length === 0 && <p className="text-sm font-bold opacity-50">No achievements added yet.</p>}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      {/* Projects List */}
                      <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Globe size={16} className="text-[#007ACC]" /> Project Showcase
                      </label>
                      {isEditing && (
                        <div className="flex gap-2 mb-4">
                          <input 
                            type="text" 
                            value={newProject} 
                            onChange={(e) => setNewProject(e.target.value)}
                            placeholder="Add a project or link..." 
                            className="flex-1 bg-[#FFFFFF] border-2 border-[#4CAF50] text-[#2C3E50] rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#007ACC]"
                          />
                          <button onClick={addProject} className="bg-[#007ACC] text-[#2C3E50] p-3 rounded-xl hover:bg-[#F0A500] transition-colors"><PlusCircle size={20} /></button>
                        </div>
                      )}
                      <ul className="space-y-3">
                        {projectsArray.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center bg-[#F4F4F4] border border-[#4CAF50] p-3 rounded-xl text-sm font-bold">
                            <span>🚀 {item}</span>
                            {isEditing && <button onClick={() => removeProject(idx)} className="text-red-500 hover:text-red-700 bg-white p-2 rounded-lg"><Trash2 size={16} /></button>}
                          </li>
                        ))}
                        {projectsArray.length === 0 && <p className="text-sm font-bold opacity-50">No projects added yet.</p>}
                      </ul>
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
