import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Save, PlusCircle, Trash2, Code, CheckCircle2,
  ArrowLeft, Settings, ListChecks, Edit3, UploadCloud, Download,
  LayoutDashboard, History, Menu, X, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('home');
  const [sidebarView, setSidebarView] = useState('overview'); // overview, contests, quizzes, history, students
  const [activeTab, setActiveTab] = useState('details');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [contests, setContests] = useState([]);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/api/v1/assessments/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        fetchContests();
      } else {
        alert("Failed to delete assessment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting assessment.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadMessage('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/v1/admin/onboard', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const txt = await res.text();
      if (res.ok) {
        setUploadMessage('Onboarded students successfully.');
        setTimeout(() => setUploadMessage(''), 5000);
      } else {
        alert('Upload failed: ' + txt);
      }
    } catch (err) {
      alert('Network error during upload');
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

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
      totalPoints: totalPoints || 0,
      durationMinutes: 120, // default duration
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: (endTime && !noEndTime) ? new Date(endTime).toISOString() : null,
      url: contestUrl,
      allowedLanguages: ['cpp', 'java', 'python', 'c'],
      questions: questions.map(q => ({
        ...q,
        points: Number(q.points) || 0,
        questionType: q.type || q.questionType || 'CODING'
      }))
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/v1/assessments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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

  // Pre-filtering for sidebar views
  const now = new Date();
  const activeContests = contests.filter(c => c.type !== 'QUIZ' && (!c.endTime || new Date(c.endTime) > now));
  const activeQuizzes = contests.filter(c => c.type === 'QUIZ' && (!c.endTime || new Date(c.endTime) > now));
  const historyList = contests.filter(c => c.endTime && new Date(c.endTime) <= now);

  const renderAssessmentList = (list) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {list.map(c => (
        <div key={c.id} className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:border-brand-300 transition-colors cursor-pointer bg-white" onClick={() => openEditor(c)}>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{c.title}</h3>
            <div className="text-[10px] text-slate-500 flex flex-wrap gap-2 font-bold uppercase tracking-wider">
              <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{c.type}</span>
              <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{c.totalPoints} pts</span>
              <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{c.questions?.length || 0} items</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={(e) => handleDelete(e, c.id)} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-lg border border-slate-100">
              <Trash2 size={16} />
            </button>
            <button className="text-brand-500 hover:text-brand-600 transition-colors bg-brand-50 p-2 rounded-lg border border-brand-100">
              <Edit3 size={16} />
            </button>
          </div>
        </div>
      ))}
      {list.length === 0 && (
         <div className="col-span-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-sm font-bold text-slate-400">No assessments found.</p>
         </div>
      )}
    </div>
  );

  if (view === 'home') {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
        {/* Mobile menu button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
        >
          {isSidebarOpen ? <X size={24} className="text-slate-600"/> : <Menu size={24} className="text-slate-600"/>}
        </button>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-72 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-center h-20 border-b border-slate-100">
            <h2 className="text-2xl font-black text-brand-600 tracking-tight">Admin<span className="text-slate-800">Panel</span></h2>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <button onClick={() => {setSidebarView('overview'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'overview' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <LayoutDashboard size={20} /> Overview
            </button>
            <button onClick={() => {setSidebarView('contests'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'contests' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <Code size={20} /> Coding Contests
            </button>
            <button onClick={() => {setSidebarView('quizzes'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'quizzes' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <ListChecks size={20} /> Quizzes
            </button>
            <button onClick={() => {setSidebarView('history'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'history' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <History size={20} /> History
            </button>
            <button onClick={() => {setSidebarView('students'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'students' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <Users size={20} /> Onboard Students
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 w-full overflow-y-auto max-h-screen">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 mt-8 md:mt-0">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight capitalize">
                {sidebarView === 'overview' ? 'Dashboard Overview' : sidebarView}
              </h1>
              <p className="text-slate-500 font-medium">Manage your system content seamlessly</p>
            </div>
            {(sidebarView === 'overview' || sidebarView === 'contests' || sidebarView === 'quizzes') && (
              <div className="flex gap-3">
                <button onClick={() => navigate('/admin/create-quiz')} className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 text-brand-600 flex items-center gap-2 hover:bg-brand-50 hover:border-brand-100 font-bold transition-all shadow-sm">
                  <PlusCircle size={18} /> New Quiz
                </button>
                <button onClick={() => openEditor(null, false)} className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-md shadow-brand-500/20">
                  <Code size={18} /> New Contest
                </button>
              </div>
            )}
          </header>

          {uploadMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 font-bold">
              <CheckCircle2 size={20} />
              {uploadMessage}
            </motion.div>
          )}

          {sidebarView === 'overview' && (
            <div className="space-y-10">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-700">Active Coding Contests</h2>
                  <button onClick={() => setSidebarView('contests')} className="text-sm font-bold text-brand-600 hover:text-brand-800">View All</button>
                </div>
                {renderAssessmentList(activeContests.slice(0, 3))}
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-700">Active Quizzes</h2>
                  <button onClick={() => setSidebarView('quizzes')} className="text-sm font-bold text-brand-600 hover:text-brand-800">View All</button>
                </div>
                {renderAssessmentList(activeQuizzes.slice(0, 3))}
              </section>
            </div>
          )}

          {sidebarView === 'contests' && (
             <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-700">All Coding Contests</h2>
                {renderAssessmentList(activeContests)}
             </div>
          )}

          {sidebarView === 'quizzes' && (
             <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-700">All Quizzes</h2>
                {renderAssessmentList(activeQuizzes)}
             </div>
          )}

          {sidebarView === 'history' && (
             <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-700">Past Assessments</h2>
                {renderAssessmentList(historyList)}
             </div>
          )}

          {sidebarView === 'students' && (
            <div className="max-w-xl mx-auto mt-10 glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-brand-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Student Onboarding</h3>
              <p className="text-sm text-slate-500 mb-8 px-4 font-medium">Upload an Excel (.xlsx) file containing admitted students to verify and create their accounts instantly.</p>
              
              <div className="w-full relative group">
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploading}
                />
                <div className={`w-full p-10 border-2 border-dashed rounded-2xl flex flex-col items-center transition-all bg-slate-50 ${isUploading ? 'border-brand-400 bg-brand-50/50' : 'border-slate-300 group-hover:border-brand-400 group-hover:bg-brand-50/30'}`}>
                  {isUploading ? (
                    <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
                  ) : (
                    <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-brand-500 transition-colors mb-4" />
                  )}
                  <span className="text-base font-bold text-slate-600 group-hover:text-brand-700 transition-colors">
                    {isUploading ? 'Processing Document...' : 'Select or drop Excel file here'}
                  </span>
                </div>
              </div>

              <a href="#" onClick={(e) => { e.preventDefault(); alert('Template downloading...'); }} className="mt-6 text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors bg-brand-50 px-4 py-2 rounded-lg">
                <Download size={16} /> Download CSV Template
              </a>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-10 p-4 md:p-8 max-w-5xl mx-auto z-10 relative text-slate-800 font-sans pb-48">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button onClick={() => setView('home')} className="text-brand-600 flex items-center gap-1 mb-4 hover:underline text-sm font-bold">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {editingId ? 'Edit Contest / Quiz' : 'Assessment Creator'}
          </h1>
        </div>

        <div className="flex items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {['details', 'challenges'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 capitalize whitespace-nowrap ${activeTab === tab ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="glass-panel p-8 rounded-2xl bg-white shadow-lg shadow-slate-200/50">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                <Globe className="text-brand-600" /> General Setup
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contest/Quiz Name</label>
                  <input type="text" value={contestName} onChange={(e) => setContestName(e.target.value)} placeholder="Enter title..." className="premium-input w-full p-4 rounded-xl text-lg font-bold placeholder-slate-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Time (IST)</label>
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="premium-input w-full p-4 rounded-xl font-medium" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      End Time (IST)
                      <input type="checkbox" checked={noEndTime} onChange={e => setNoEndTime(e.target.checked)} className="ml-2 accent-brand-600" /> No deadline
                    </label>
                    <input type="datetime-local" value={endTime} disabled={noEndTime} onChange={(e) => setEndTime(e.target.value)} className={`premium-input w-full p-4 rounded-xl font-medium ${noEndTime ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div key="challenges" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-20">
            <button onClick={addCodingProblem} className="bg-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-50 text-brand-700 transition-all font-bold border border-brand-200 shadow-sm">
              <PlusCircle size={20} /> Add New Challenge
            </button>

            {questions.map((q, index) => (
              <div key={index} className="glass-panel p-8 rounded-2xl relative border-l-4 border-l-brand-500 bg-white shadow-md">
                <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 hover:bg-red-50 rounded-lg">
                  <Trash2 size={20} />
                </button>

                <div className="mb-6 flex flex-col lg:flex-row gap-6 pr-10">
                  <div className="flex-1 space-y-5">
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Challenge Name *</label>
                      <input type="text" placeholder="Title" value={q.title} onChange={(e) => updateQuestion(index, 'title', e.target.value)} className="premium-input w-full p-3.5 rounded-xl font-bold placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Problem Statement *</label>
                      <textarea placeholder="Markdown description..." value={q.description} onChange={(e) => updateQuestion(index, 'description', e.target.value)} className="premium-input w-full p-4 rounded-xl h-32 text-sm font-mono placeholder-slate-400" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 w-48">
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Score Points</label>
                    <input type="number" value={q.points} onChange={e => updateQuestion(index, 'points', e.target.value)} className="premium-input p-3 rounded-xl font-bold text-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Input Format *</label>
                    <textarea placeholder="Describe input shape..." value={q.inputFormat} onChange={(e) => updateQuestion(index, 'inputFormat', e.target.value)} className="premium-input w-full p-4 rounded-xl h-24 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Output Format *</label>
                    <textarea placeholder="Describe output shape..." value={q.outputFormat} onChange={(e) => updateQuestion(index, 'outputFormat', e.target.value)} className="premium-input w-full p-4 rounded-xl h-24 text-sm" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Constraints *</label>
                  <input type="text" placeholder="e.g., 1 <= N <= 10^5" value={q.constraints} onChange={e => updateQuestion(index, 'constraints', e.target.value)} className="premium-input w-full p-4 rounded-xl text-sm font-medium" />
                </div>

                {/* Integrated Test Cases */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-bold text-brand-700 flex items-center gap-2 uppercase tracking-widest">
                      <Settings size={18} /> Test Case Manager ({q.testCases.length})
                    </h3>
                    <button onClick={() => addTestCase(index)} className="text-xs bg-brand-50 text-brand-700 px-4 py-2 rounded-lg border border-brand-200 hover:bg-brand-100 transition-all flex items-center gap-1 font-bold">
                      <PlusCircle size={16} /> Add Test Case
                    </button>
                  </div>

                  <div className="space-y-4">
                    {q.testCases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="bg-slate-50 p-5 rounded-2xl flex flex-col md:flex-row gap-5 relative group border border-slate-200 shadow-sm">
                        <button onClick={() => removeTestCase(index, tcIdx)} className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                        <div className="flex-1">
                          <label className="block text-xs text-slate-500 font-bold mb-1">Stdin Input</label>
                          <textarea placeholder="e.g. 5" value={tc.input} onChange={e => updateTestCase(index, tcIdx, 'input', e.target.value)} className="premium-input w-full p-3 h-24 text-sm font-mono rounded-xl bg-white" />
                          <label className="flex items-center gap-2 mt-3 text-sm font-bold text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={tc.isSample} onChange={e => updateTestCase(index, tcIdx, 'isSample', e.target.checked)} className="accent-brand-600 w-4 h-4" />
                            Show as Sample (Visible to students)
                          </label>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-slate-500 font-bold mb-1">Expected Stdout</label>
                          <textarea placeholder="e.g. 25" value={tc.expectedOutput} onChange={e => updateTestCase(index, tcIdx, 'expectedOutput', e.target.value)} className="premium-input w-full p-3 h-24 text-sm font-mono rounded-xl bg-white" />
                        </div>
                      </div>
                    ))}
                    {q.testCases.length === 0 && (
                      <div className="text-center py-6 border-2 border-dashed border-red-200 bg-red-50/50 rounded-2xl">
                        <p className="text-sm text-red-600 font-bold">No test cases added. At least one is mandatory to publish.</p>
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
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex justify-end items-center gap-4">
        {publishSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-brand-700 flex items-center gap-2 font-bold bg-brand-100 border border-brand-300 px-6 py-3 rounded-2xl shadow-xl">
            <CheckCircle2 size={20} /> Contest Saved!
          </motion.div>
        )}
        <button
          onClick={handlePublish}
          disabled={!contestName || isPublishing || questions.length === 0}
          className={`btn-primary px-8 py-3.5 rounded-xl font-black tracking-wider uppercase text-sm flex items-center gap-3 transition-all shadow-xl ${(!contestName || isPublishing || questions.length === 0) ? 'opacity-50 cursor-not-allowed bg-slate-300 shadow-none text-slate-500' : 'hover:-translate-y-1 hover:shadow-brand-500/30'}`}
        >
          {isPublishing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
          {editingId ? 'Update Contest' : 'Publish Contest'}
        </button>
      </div>
    </div>
  );
}