import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Save, PlusCircle, Trash2, Code, CheckCircle2,
  ArrowLeft, Settings, ListChecks, Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('details');

  const [contests, setContests] = useState([]);

  // Editor State
  const [editingId, setEditingId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const [contestName, setContestName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [noEndTime, setNoEndTime] = useState(false);
  const [type, setType] = useState('CODING');
  const [contestUrl, setContestUrl] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/assessments');
      if (res.ok) {
        setContests(await res.json());
      }
    } catch (e) { console.error(e) }
  };

  useEffect(() => {
    if (contestName && !editingId) {
      const formatted = contestName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setContestUrl(`https://assesshub.gcee.ac.in/c/${formatted}`);
    } else if (!contestName && !editingId) {
      setContestUrl('');
    }
  }, [contestName, editingId]);

  const openEditor = (contest = null, isQuiz = false) => {
    if (contest) {
      setEditingId(contest.id);
      setContestName(contest.title);
      setStartTime(contest.startTime ? contest.startTime.slice(0, 16) : '');
      setEndTime(contest.endTime ? contest.endTime.slice(0, 16) : '');
      setNoEndTime(!contest.endTime);
      setType(contest.type);
      setContestUrl(contest.url || '');
      setQuestions(contest.questions || []);
    } else {
      setEditingId(null);
      setContestName('');
      setStartTime('');
      setEndTime('');
      setNoEndTime(false);
      setType(isQuiz ? 'QUIZ' : 'CODING');
      setQuestions([]);
    }
    setActiveTab('details');
    setView('editor');
  };

  const addCodingProblem = () => {
    setQuestions([...questions, {
      type: 'CODING',
      title: '',
      description: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      points: 50,
      testCases: []
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addTestCase = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].testCases.push({ input: '', expectedOutput: '', isSample: false });
    setQuestions(updated);
  };

  const updateTestCase = (qIndex, tcIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].testCases[tcIndex][field] = value;
    setQuestions(updated);
  };

  const removeTestCase = (qIndex, tcIndex) => {
    const updated = [...questions];
    updated[qIndex].testCases.splice(tcIndex, 1);
    setQuestions(updated);
  };

  const handlePublish = async () => {
    const hasInvalidChallenge = questions.some(q =>
      !q.title || !q.description || !q.inputFormat || !q.outputFormat || !q.constraints || q.testCases.length === 0
    );

    if (hasInvalidChallenge) {
      alert("Please ensure all challenge details are filled and at least one test case is added for every challenge.");
      return;
    }

    setIsPublishing(true);
    const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0);

    const payload = {
      id: editingId,
      title: contestName,
      description: `Contest ID: ${contestUrl}`,
      type: type,
      totalPoints,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: (endTime && !noEndTime) ? new Date(endTime).toISOString() : null,
      url: contestUrl,
      allowedLanguages: ['cpp', 'java', 'python', 'c'],
      questions
    };

    try {
      const res = await fetch('http://localhost:8081/api/v1/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 3000);
        fetchContests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishing(false);
    }
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen pt-12 p-4 md:p-8 max-w-6xl mx-auto z-10 relative text-slate-200 pb-32">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
              Admin Overview
            </h1>
            <p className="text-slate-400 mt-2">Manage Contests and Quizzes</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/create-quiz')} className="glass-panel px-4 py-2 rounded-xl text-emerald-400 flex items-center gap-2 hover:bg-emerald-500/10 font-medium">
              <ListChecks size={18} /> Create Quiz
            </button>
            <button onClick={() => openEditor(null, false)} className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 font-medium">
              <Code size={18} /> Create Contest
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map(c => (
            <div key={c.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-slate-700 hover:border-violet-500 transition-colors cursor-pointer" onClick={() => openEditor(c)}>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
                <div className="text-xs text-slate-400 flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-800 px-2 py-1 rounded">{c.type}</span>
                  <span className="bg-slate-800 px-2 py-1 rounded">{c.totalPoints} pts</span>
                  <span className="bg-slate-800 px-2 py-1 rounded">{c.questions?.length || 0} items</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Edit3 size={16} className="text-violet-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 p-4 md:p-8 max-w-5xl mx-auto z-10 relative text-slate-200 font-sans pb-48">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button onClick={() => setView('home')} className="text-emerald-400 flex items-center gap-1 mb-4 hover:underline text-sm font-medium">
            <ArrowLeft size={16} /> Back to Overview
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            {editingId ? 'Edit Contest' : 'Contest Creator'}
          </h1>
        </div>

        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 overflow-x-auto">
          {['details', 'challenges'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 capitalize whitespace-nowrap ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="glass-panel p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="text-emerald-400" /> General Setup
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Contest Name</label>
                  <input type="text" value={contestName} onChange={(e) => setContestName(e.target.value)} placeholder="Enter contest title..." className="premium-input w-full p-4 rounded-xl text-lg font-semibold" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Start Time (IST)</label>
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="premium-input w-full p-4 rounded-xl" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      End Time (IST)
                      <input type="checkbox" checked={noEndTime} onChange={e => setNoEndTime(e.target.checked)} className="ml-2" /> No Limit
                    </label>
                    <input type="datetime-local" value={endTime} disabled={noEndTime} onChange={(e) => setEndTime(e.target.value)} className={`premium-input w-full p-4 rounded-xl ${noEndTime ? 'opacity-50' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div key="challenges" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <button onClick={addCodingProblem} className="glass-panel px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-violet-500/20 text-violet-400 transition-all font-semibold border border-violet-500/30">
              <PlusCircle size={20} /> Add New Challenge
            </button>

            {questions.map((q, index) => (
              <div key={index} className="glass-panel p-6 rounded-2xl relative border-l-4 border-l-emerald-500 bg-slate-800/40">
                <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors">
                  <Trash2 size={20} />
                </button>

                <div className="mb-4 flex gap-4 pr-10">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 uppercase mb-2 font-bold tracking-wider">Challenge Name *</label>
                    <input type="text" placeholder="Title" value={q.title} onChange={(e) => updateQuestion(index, 'title', e.target.value)} className="premium-input w-full p-3 rounded-xl font-bold mb-3" />

                    <label className="block text-xs text-slate-400 uppercase mb-2 font-bold tracking-wider">Problem Statement *</label>
                    <textarea placeholder="Markdown description..." value={q.description} onChange={(e) => updateQuestion(index, 'description', e.target.value)} className="premium-input w-full p-3 rounded-xl h-32 text-sm font-mono" />
                  </div>
                  <div className="flex flex-col gap-3 w-48">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Score Points</label>
                    <input type="number" value={q.points} onChange={e => updateQuestion(index, 'points', e.target.value)} className="premium-input p-2 rounded-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase mb-2 font-bold tracking-wider">Input Format *</label>
                    <textarea placeholder="Describe input shape..." value={q.inputFormat} onChange={(e) => updateQuestion(index, 'inputFormat', e.target.value)} className="premium-input w-full p-3 rounded-xl h-24 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase mb-2 font-bold tracking-wider">Output Format *</label>
                    <textarea placeholder="Describe output shape..." value={q.outputFormat} onChange={(e) => updateQuestion(index, 'outputFormat', e.target.value)} className="premium-input w-full p-3 rounded-xl h-24 text-sm" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs text-slate-400 uppercase mb-2 font-bold tracking-wider">Constraints *</label>
                  <input type="text" placeholder="e.g., 1 <= N <= 10^5" value={q.constraints} onChange={e => updateQuestion(index, 'constraints', e.target.value)} className="premium-input w-full p-3 rounded-xl text-sm" />
                </div>

                {/* Integrated Test Cases */}
                <div className="mt-8 border-t border-slate-700 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                      <Settings size={16} /> Test Case Manager ({q.testCases.length})
                    </h3>
                    <button onClick={() => addTestCase(index)} className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1 font-bold">
                      <PlusCircle size={14} /> Add Test Case
                    </button>
                  </div>

                  <div className="space-y-3">
                    {q.testCases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="bg-slate-900/40 p-4 rounded-xl flex gap-4 relative group border border-slate-700/50">
                        <button onClick={() => removeTestCase(index, tcIdx)} className="absolute -top-2 -right-2 bg-slate-800 text-rose-500 p-1.5 rounded-full border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Trash2 size={14} />
                        </button>
                        <div className="flex-1">
                          <textarea placeholder="Stdin Input" value={tc.input} onChange={e => updateTestCase(index, tcIdx, 'input', e.target.value)} className="premium-input w-full p-2 h-20 text-xs font-mono rounded-lg" />
                          <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer">
                            <input type="checkbox" checked={tc.isSample} onChange={e => updateTestCase(index, tcIdx, 'isSample', e.target.checked)} className="accent-emerald-500" />
                            Show as Sample (Visible to students)
                          </label>
                        </div>
                        <div className="flex-1">
                          <textarea placeholder="Expected Stdout" value={tc.expectedOutput} onChange={e => updateTestCase(index, tcIdx, 'expectedOutput', e.target.value)} className="premium-input w-full p-2 h-20 text-xs font-mono rounded-lg" />
                        </div>
                      </div>
                    ))}
                    {q.testCases.length === 0 && (
                      <div className="text-center py-4 border-2 border-dashed border-slate-700/50 rounded-xl">
                        <p className="text-xs text-rose-400 italic font-bold">No test cases added. At least one is mandatory to publish.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED FOOTER FIX: Floating container that doesn't block underlying content */}
      <div className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none flex justify-end items-center gap-4">
        {publishSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-auto text-emerald-400 flex items-center gap-2 font-bold bg-slate-900 border border-emerald-500/50 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl">
            <CheckCircle2 size={20} /> Contest Saved!
          </motion.div>
        )}
        <button
          onClick={handlePublish}
          disabled={!contestName || isPublishing || questions.length === 0}
          className={`pointer-events-auto btn-primary px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-sm flex items-center gap-3 transition-all shadow-2xl ${(!contestName || isPublishing || questions.length === 0) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-2 hover:scale-105 active:scale-95 shadow-emerald-500/40'}`}
        >
          {isPublishing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
          {editingId ? 'Update Contest' : 'Publish Contest'}
        </button>
      </div>
    </div>
  );
}