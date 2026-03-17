import { useState } from 'react';
import {
  PlusCircle, Code, ListChecks, ArrowLeft, Save,
  Trash2, Plus, Globe, Clock, Trophy, ChevronDown
} from 'lucide-react';

export default function AdminDashboard() {
  const [view, setView] = useState('main'); // 'main', 'quiz', 'coding'
  const [assessment, setAssessment] = useState({
    title: '', description: '', points: 10, duration: 30, questions: []
  });

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {view === 'main' ? 'Command Center' : `Create ${view === 'quiz' ? 'Quiz' : 'Coding Contest'}`}
        </h1>
        <p className="text-slate-400">GCEE Institutional Management</p>
      </div>
      {view !== 'main' && (
        <button onClick={() => setView('main')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Center
        </button>
      )}
    </div>
  );

  const MainDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => setView('quiz')}
        className="glass-panel p-8 rounded-2xl border-2 border-transparent hover:border-emerald-500/50 transition-all text-left group"
      >
        <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <ListChecks className="text-emerald-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Add New Quiz</h2>
        <p className="text-slate-400">Create multiple choice questions with custom time limits and topics.</p>
      </button>

      <button
        onClick={() => setView('coding')}
        className="glass-panel p-8 rounded-2xl border-2 border-transparent hover:border-violet-500/50 transition-all text-left group"
      >
        <div className="w-14 h-14 bg-violet-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Code className="text-violet-400 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Create Coding Contest</h2>
        <p className="text-slate-400">Add problem statements, test cases, and select allowed Judge0 languages.</p>
      </button>
    </div>
  );

  const CodingBuilder = () => (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-700 pb-2">
          <Globe size={18} className="text-violet-400" /> General Information
        </h3>
        <input type="text" placeholder="Contest Name (e.g. Dynamic Programming Basics)" className="premium-input w-full p-3 rounded-lg" />
        <textarea placeholder="Contest Description..." className="premium-input w-full p-3 rounded-lg h-24" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <Trophy className="text-amber-400" size={20} />
            <input type="number" placeholder="Total Points" className="bg-transparent border-none outline-none w-full" />
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <Clock className="text-emerald-400" size={20} />
            <input type="number" placeholder="Duration (Mins)" className="bg-transparent border-none outline-none w-full" />
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-700 pb-2">
          <PlusCircle size={18} className="text-emerald-400" /> Problem Statement
        </h3>
        <input type="text" placeholder="Problem Name (e.g., Array Rotation)" className="premium-input w-full p-3 rounded-lg" />
        <textarea placeholder="Full Problem Statement... (Supports Markdown)" className="premium-input w-full p-3 rounded-lg h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea placeholder="Input Format..." className="premium-input w-full p-3 rounded-lg h-20" />
          <textarea placeholder="Output Format..." className="premium-input w-full p-3 rounded-lg h-20" />
        </div>
        <textarea placeholder="Constraints (e.g., 1 <= N <= 10^5)" className="premium-input w-full p-3 rounded-lg" />

        <div className="p-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-600">
          <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
            <Save size={14} /> Test Case Setup
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <textarea placeholder="Standard Input" className="premium-input p-2 text-xs rounded h-16" />
              <textarea placeholder="Expected Output" className="premium-input p-2 text-xs rounded h-16" />
            </div>
            <button className="text-xs text-emerald-400 flex items-center gap-1 hover:underline">
              <Plus size={14} /> Add Another Test Case
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 flex gap-4">
        <button className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-xl">
          <Save size={20} /> Publish Contest
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-12 p-4 md:p-8 max-w-7xl mx-auto z-10 relative">
      {renderHeader()}
      {view === 'main' && <MainDashboard />}
      {view === 'coding' && <CodingBuilder />}
      {view === 'quiz' && (
        <div className="text-center p-20 glass-panel rounded-2xl">
          <ListChecks className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Quiz Builder Mode</h2>
          <p className="text-slate-400">Quiz builder logic follows similar "Google Form" structure.</p>
          <button onClick={() => setView('main')} className="mt-6 text-emerald-400">Back to Dashboard</button>
        </div>
      )}
    </div>
  );
}