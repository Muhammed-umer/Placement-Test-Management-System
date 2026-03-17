import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Clock, Save, PlusCircle, Trash2,
  Code, ListChecks, Link as LinkIcon, CheckCircle2,
  Calendar, ArrowLeft, Home, Edit3, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JUDGE0_LANGUAGES = [
  { id: 54, name: 'C++ (GCC 9.2.0)', value: 'cpp' },
  { id: 62, name: 'Java (OpenJDK 13)', value: 'java' },
  { id: 71, name: 'Python (3.8.1)', value: 'python' },
  { id: 50, name: 'C (GCC 9.2.0)', value: 'c' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('home'); // 'home' or 'editor'
  const [activeTab, setActiveTab] = useState('details'); // details, challenges, testcases, languages

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
  const [allowedLanguages, setAllowedLanguages] = useState(['cpp', 'java', 'python', 'c']);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/assessments');
      if (res.ok) {
        setContests(await res.json());
      }
    } catch(e) { console.error(e) }
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
      setAllowedLanguages(contest.allowedLanguages || ['cpp', 'java', 'python', 'c']);
    } else {
      setEditingId(null);
      setContestName('');
      setStartTime('');
      setEndTime('');
      setNoEndTime(false);
      setType(isQuiz ? 'QUIZ' : 'CODING');
      setQuestions([]);
      setAllowedLanguages(['cpp', 'java', 'python', 'c']);
    }
    setActiveTab('details');
    setView('editor');
  };

  const addCodingProblem = () => {
    setQuestions([...questions, {
      type: 'CODING',
      title: 'New Coding Challenge',
      description: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      points: 50,
      testCases: [{ input: '', expectedOutput: '', isSample: true }]
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

  const toggleLanguage = (val) => {
    if (allowedLanguages.includes(val)) {
      setAllowedLanguages(allowedLanguages.filter(l => l !== val));
    } else {
      setAllowedLanguages([...allowedLanguages, val]);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0);
    let durationMinutes = 60;
    if (startTime && endTime && !noEndTime) {
      const mDiff = (new Date(endTime) - new Date(startTime)) / 60000;
      durationMinutes = Math.abs(mDiff);
    }

    const payload = {
      id: editingId,
      title: contestName,
      description: `Contest ID: ${contestUrl}`,
      type: type,
      totalPoints,
      durationMinutes,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: (endTime && !noEndTime) ? new Date(endTime).toISOString() : null,
      url: contestUrl,
      allowedLanguages,
      questions
    };

    try {
      const res = await fetch('http://localhost:8081/api/v1/assessments', {
        method: 'POST', // or PUT if standard, but our AssessmentController POST can update if ID exists, actually DataJPA save() updates if ID is present. Wait, let's verify DataJPA save. Yes, it updates if ID exists.
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
      <div className="min-h-screen pt-12 p-4 md:p-8 max-w-6xl mx-auto z-10 relative text-slate-200">
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
                <div className="text-sm font-mono text-slate-500">
                  <p>Start: {c.startTime ? new Date(c.startTime).toLocaleString() : 'TBD'}</p>
                  <p>End: {c.endTime ? new Date(c.endTime).toLocaleString() : 'No Limit'}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="text-violet-400 flex items-center gap-1 text-sm font-medium">
                  <Edit3 size={16} /> Edit
                </button>
              </div>
            </div>
          ))}
          {contests.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 border border-dashed border-slate-700 rounded-2xl">
              No contests found. Click "Create Contest" to start.
            </div>
          )}
        </div>
      </div>
    );
  }

  // EDITOR VIEW
  return (
    <div className="min-h-screen pt-12 p-4 md:p-8 max-w-5xl mx-auto z-10 relative text-slate-200 font-sans pb-32">
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
          {['details', 'challenges', 'testcases', 'languages'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 capitalize whitespace-nowrap ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
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
                <Globe className="text-emerald-400" /> General Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Contest Name</label>
                  <input type="text" value={contestName} onChange={(e) => setContestName(e.target.value)} className="premium-input w-full p-4 rounded-xl text-lg font-semibold" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Start Time (IST)</label>
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="premium-input w-full p-4 rounded-xl" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      End Time (IST) 
                      <input type="checkbox" checked={noEndTime} onChange={e => setNoEndTime(e.target.checked)} className="ml-2" /> No End Time
                    </label>
                    <input type="datetime-local" value={endTime} disabled={noEndTime} onChange={(e) => setEndTime(e.target.value)} className={`premium-input w-full p-4 rounded-xl ${noEndTime ? 'opacity-50' : ''}`} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <LinkIcon size={16} /> Default URL Alias
                  </label>
                  <input type="text" value={contestUrl} onChange={e => setContestUrl(e.target.value)} className="premium-input w-full p-3 rounded-xl font-mono text-emerald-400 text-sm" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div key="challenges" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <button onClick={addCodingProblem} className="glass-panel px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-violet-500/20 text-violet-400 transition-all font-semibold">
              <Code size={20} /> Add Challenge
            </button>

            {questions.map((q, index) => (
              <div key={index} className="glass-panel p-6 rounded-2xl relative border-l-4 border-l-emerald-500">
                <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors">
                  <Trash2 size={20} />
                </button>
                <div className="mb-4 flex gap-4 pr-10">
                   <div className="flex-1">
                     <input type="text" placeholder="Problem Title" value={q.title} onChange={(e) => updateQuestion(index, 'title', e.target.value)} className="premium-input w-full p-3 rounded-xl font-bold mb-3" />
                     <textarea placeholder="Problem Statement (Markdown)" value={q.description} onChange={(e) => updateQuestion(index, 'description', e.target.value)} className="premium-input w-full p-3 rounded-xl h-32 text-sm font-mono" />
                   </div>
                   <div className="flex flex-col gap-3 w-48">
                     <label className="text-xs text-slate-400">Points</label>
                     <input type="number" value={q.points} onChange={e => updateQuestion(index, 'points', e.target.value)} className="premium-input p-2 rounded-lg" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <textarea placeholder="Input Format" value={q.inputFormat} onChange={(e) => updateQuestion(index, 'inputFormat', e.target.value)} className="premium-input w-full p-3 rounded-xl h-20 text-sm" />
                  <textarea placeholder="Output Format" value={q.outputFormat} onChange={(e) => updateQuestion(index, 'outputFormat', e.target.value)} className="premium-input w-full p-3 rounded-xl h-20 text-sm" />
                </div>
                <input type="text" placeholder="Constraints" value={q.constraints} onChange={e => updateQuestion(index, 'constraints', e.target.value)} className="premium-input w-full p-3 rounded-xl mt-4 text-sm" />
              </div>
            ))}
            {questions.length === 0 && <div className="text-slate-500 text-center py-10">No challenges yet.</div>}
          </motion.div>
        )}

        {activeTab === 'testcases' && (
          <motion.div key="testcases" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="text-emerald-400"/> Test Case Manager</h2>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                  <h3 className="font-bold text-white">Q{qIndex + 1}: {q.title || 'Untitled'}</h3>
                  <button onClick={() => addTestCase(qIndex)} className="text-xs text-violet-400 hover:text-white flex items-center gap-1 bg-violet-500/10 px-3 py-1.5 rounded-lg">
                    <PlusCircle size={14} /> Add Test Case
                  </button>
                </div>
                <div className="space-y-3">
                  {q.testCases?.map((tc, tcIdx) => (
                    <div key={tcIdx} className="bg-slate-800/80 p-4 rounded-xl flex gap-4 relative group">
                      <button onClick={() => removeTestCase(qIndex, tcIdx)} className="absolute top-2 right-2 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-rose-400">
                        <Trash2 size={16} />
                      </button>
                      <div className="flex-1">
                        <textarea placeholder="Input" value={tc.input} onChange={e => updateTestCase(qIndex, tcIdx, 'input', e.target.value)} className="premium-input w-full p-2 h-16 text-xs font-mono rounded-lg mb-2" />
                        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                          <input type="checkbox" checked={tc.isSample} onChange={e => updateTestCase(qIndex, tcIdx, 'isSample', e.target.checked)} className="rounded bg-slate-700 border-slate-600 text-emerald-500" />
                          Sample Case (Visible to students)
                        </label>
                      </div>
                      <div className="flex-1">
                        <textarea placeholder="Expected Output" value={tc.expectedOutput} onChange={e => updateTestCase(qIndex, tcIdx, 'expectedOutput', e.target.value)} className="premium-input w-full p-2 h-16 text-xs font-mono rounded-lg" />
                      </div>
                    </div>
                  ))}
                  {(!q.testCases || q.testCases.length === 0) && <p className="text-xs text-slate-500">No test cases. Add one to grade correctly.</p>}
                </div>
              </div>
            ))}
            {questions.length === 0 && <div className="text-slate-500 py-10">Add challenges first to manage test cases.</div>}
          </motion.div>
        )}

        {activeTab === 'languages' && (
          <motion.div key="languages" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel p-8 rounded-2xl max-w-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Code className="text-emerald-400"/> Allowed Languages</h2>
            <div className="space-y-4">
              {JUDGE0_LANGUAGES.map(lang => (
                <label key={lang.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-800">
                  <span className="font-mono text-sm">{lang.name}</span>
                  <input type="checkbox" className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-900" 
                    checked={allowedLanguages.includes(lang.value)} onChange={() => toggleLanguage(lang.value)} />
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 z-50 flex justify-end items-center gap-4">
        {publishSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400 flex items-center gap-2 font-semibold bg-emerald-500/10 px-4 py-2 rounded-xl">
            <CheckCircle2 size={18} /> Contest Saved & Broadcasted!
          </motion.div>
        )}
        <button
          onClick={handlePublish}
          disabled={!contestName || isPublishing}
          className={`btn-primary px-8 py-3.5 rounded-xl font-bold tracking-wide flex items-center gap-2 transition-all ${(!contestName || isPublishing) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
        >
          {isPublishing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
          {editingId ? (isPublishing ? 'Updating...' : 'Update Contest') : (isPublishing ? 'Publishing...' : 'Publish Contest')}
        </button>
      </div>
    </div>
  );
}