import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Github, Linkedin, Trophy, Code2, Save, Bell, ChevronRight, Activity } from 'lucide-react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AnimatePresence, motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: 'Student Name',
    github: 'https://github.com/student',
    linkedin: 'https://linkedin.com/in/student',
    projects: '1. E-commerce App\n2. ML Prediction Model',
    achievements: 'First Prize in Hackathon'
  });

  const [activeAssessments, setActiveAssessments] = useState([]);
  const [notifications, setNotifications] = useState(0);

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
    // Initial fetch
    fetchAssessments();

    // WebSocket Connection
    const socket = new SockJS('http://localhost:8081/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/assessments', (message) => {
        if (message.body) {
          // Increment Notification Badge
          setNotifications(n => n + 1);
          // Refetch to sync active assessments instantly
          fetchAssessments();
        }
      });
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  const clearNotifications = () => {
    setNotifications(0);
  };

  return (
    <div className="min-h-screen pt-12 p-4 md:p-8 max-w-6xl mx-auto z-10 relative text-slate-200">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Portfolio Hub
          </h1>
          <p className="text-slate-400 mt-1 font-medium tracking-wide">Manage your professional profile and take active assessments</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={clearNotifications}>
            <Bell className="w-6 h-6 text-slate-300 hover:text-white transition-colors" />
            <AnimatePresence>
              {notifications > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg"
                >
                  {notifications}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => navigate('/assessment')}
            className="btn-primary px-6 py-2.5 rounded-xl font-bold tracking-wide flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Code2 className="w-5 h-5" />
            Enter Sandbox
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-panel rounded-3xl p-6 border-slate-700/50">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center mb-4 shadow-xl">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-emerald-400">{profile.name}</h2>
            <p className="text-slate-500 text-sm">B.E. Computer Science</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GitHub Link</label>
              <div className="flex items-center gap-2 mt-1 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <Github className="w-4 h-4 text-slate-400" />
                <input className="bg-transparent border-none outline-none w-full text-sm text-slate-300" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LinkedIn Link</label>
              <div className="flex items-center gap-2 mt-1 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <Linkedin className="w-4 h-4 text-slate-400" />
                <input className="bg-transparent border-none outline-none w-full text-sm text-slate-300" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Active Assessments Real-Time Section */}
          <div className="glass-panel rounded-3xl p-6 border-slate-700/50 border-t-4 border-t-violet-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
            
            <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <Activity className="w-5 h-5 text-violet-400" />
              Active Assessments
            </h3>
            
            {activeAssessments.length === 0 ? (
              <div className="text-slate-500 text-sm p-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                No active assessments available at the moment. Waiting for Admin to publish.
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {activeAssessments.map((assessment) => (
                    <motion.div 
                      key={assessment.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      layout
                      className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:border-violet-500/50 transition-colors group cursor-pointer"
                    >
                      <div>
                        <h4 className="font-semibold text-white group-hover:text-violet-300 transition-colors">{assessment.title}</h4>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                          <span className={`${assessment.type === 'QUIZ' ? 'text-amber-400' : 'text-emerald-400'} font-bold`}>{assessment.type}</span>
                          <span>•</span>
                          <span>{assessment.durationMinutes} mins</span>
                          <span>•</span>
                          <span>{assessment.totalPoints} points</span>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/assessment/${assessment.id}`)} className="text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500 p-2 rounded-lg transition-all flex items-center">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-3xl p-6 border-slate-700/50">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-200 mb-4">
              <Code2 className="w-5 h-5 text-emerald-500" />
              Project Showcase
            </h3>
            <textarea 
              className="w-full h-32 premium-input rounded-xl p-4 text-sm resize-none font-mono"
              value={profile.projects}
              onChange={e => setProfile({...profile, projects: e.target.value})}
              placeholder="List your best projects and their tech stacks..."
            />
          </div>

          <div className="glass-panel rounded-3xl p-6 border-slate-700/50">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-200 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievements
            </h3>
            <textarea 
              className="w-full h-32 premium-input rounded-xl p-4 text-sm resize-none font-mono"
              value={profile.achievements}
              onChange={e => setProfile({...profile, achievements: e.target.value})}
              placeholder="Awards, hackathon wins, competitive programming ranks..."
            />
          </div>
          
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-emerald-600 text-slate-100 px-6 py-3 rounded-xl transition-colors border border-slate-600 font-bold tracking-wide">
              <Save className="w-5 h-5" />
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
