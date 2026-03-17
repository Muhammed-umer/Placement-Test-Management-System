import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Github, Linkedin, Trophy, Code2, Save } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: 'Student Name',
    github: 'https://github.com/student',
    linkedin: 'https://linkedin.com/in/student',
    projects: '1. E-commerce App\n2. ML Prediction Model',
    achievements: 'First Prize in Hackathon'
  });

  return (
    <div className="min-h-screen pt-12 p-4 md:p-8 max-w-6xl mx-auto z-10 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-sans text-slate-50">Portfolio Hub</h1>
          <p className="text-slate-400 mt-1">Manage your professional profile and take active assessments</p>
        </div>
        
        <button 
          onClick={() => navigate('/assessment')}
          className="btn-primary px-6 py-2.5 rounded-lg font-medium flex-shrink-0 flex items-center gap-2"
        >
          <Code2 className="w-5 h-5" />
          Enter Assessment Arena
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-panel rounded-2xl p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-emerald-400">{profile.name}</h2>
            <p className="text-slate-500 text-sm">B.E. Computer Science</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GitHub Link</label>
              <div className="flex items-center gap-2 mt-1 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                <Github className="w-4 h-4 text-slate-400" />
                <input className="bg-transparent border-none outline-none w-full text-sm text-slate-300" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LinkedIn Link</label>
              <div className="flex items-center gap-2 mt-1 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                <Linkedin className="w-4 h-4 text-slate-400" />
                <input className="bg-transparent border-none outline-none w-full text-sm text-slate-300" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-200 mb-4">
              <Code2 className="w-5 h-5 text-emerald-500" />
              Project Showcase
            </h3>
            <textarea 
              className="w-full h-32 premium-input rounded-lg p-3 text-sm resize-none"
              value={profile.projects}
              onChange={e => setProfile({...profile, projects: e.target.value})}
              placeholder="List your best projects and their tech stacks..."
            />
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-200 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievements
            </h3>
            <textarea 
              className="w-full h-32 premium-input rounded-lg p-3 text-sm resize-none"
              value={profile.achievements}
              onChange={e => setProfile({...profile, achievements: e.target.value})}
              placeholder="Awards, hackathon wins, competitive programming ranks..."
            />
          </div>
          
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-5 py-2.5 rounded-lg transition-colors border border-slate-600">
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
