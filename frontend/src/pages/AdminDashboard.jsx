import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Save, PlusCircle, Trash2, Code, CheckCircle2,
  ArrowLeft, Settings, ListChecks, Edit3, UploadCloud, Download,
  LayoutDashboard, History, Menu, X, Users, Search, SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('home');
  const [sidebarView, setSidebarView] = useState('overview'); // overview, contests, quizzes, history, students
  const [activeTab, setActiveTab] = useState('details');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [contests, setContests] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [viewingAssessmentUrl, setViewingAssessmentUrl] = useState('');
  
  // Submission Filters State
  const [subSearch, setSubSearch] = useState('');
  const [subMinScore, setSubMinScore] = useState('');
  const [subMaxScore, setSubMaxScore] = useState('');
  const [subSortBy, setSubSortBy] = useState('scoreDesc');
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // Editor State
  const [editingId, setEditingId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [contestName, setContestName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [noEndTime, setNoEndTime] = useState(false);
  const [type, setType] = useState('CODING');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [contestUrl, setContestUrl] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchContests = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/v1/assessments');
      if (res.ok) {
        setContests(await res.json());
      }
    } catch (e) { console.error(e) }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/v1/admin/students', {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) setStudentsList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchSubmissions = async (assessmentId, assessmentUrl) => {
    try {
      const res = await fetch(`http://localhost:8081/api/v1/leaderboard/${assessmentId}`);
      if (res.ok) {
        setSubmissionsList(await res.json());
        setViewingAssessmentUrl(assessmentUrl || '');
        setSidebarView('submissions');
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (sidebarView === 'students') {
      fetchStudents();
    }
  }, [sidebarView]);

  useEffect(() => {
    if (contestName && !editingId) {
      setContestUrl(`${window.location.origin}/assessment/PENDING-ID`);
    } else if (editingId) {
      setContestUrl(`${window.location.origin}/assessment/${editingId}`);
    } else {
      setContestUrl('');
    }
  }, [contestName, editingId]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/api/v1/assessments/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        fetchContests();
        setToastMessage({ title: "Assessment deleted successfully.", type: 'success' });
      } else {
        setToastMessage({ title: "Failed to delete assessment.", type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToastMessage({ title: "Error deleting assessment.", type: 'error' });
    } finally {
      setDeleteConfirmId(null);
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
        setToastMessage({ title: 'Upload failed: ' + txt, type: 'error' });
      }
    } catch (err) {
      setToastMessage({ title: 'Network error during upload', type: 'error' });
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
      setMaxAttempts(contest.maxAttempts || 1);
      setContestUrl(contest.url || '');
      setQuestions(contest.questions || []);
    } else {
      setEditingId(null);
      setContestName('');
      setStartTime('');
      setEndTime('');
      setNoEndTime(false);
      setType(isQuiz ? 'QUIZ' : 'CODING');
      setMaxAttempts(1);
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
      setToastMessage({ title: "Please ensure all challenge details are filled and at least one test case is added for every challenge.", type: 'error' });
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
      maxAttempts: Number(maxAttempts) || 1,
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
      <AnimatePresence>
        {list.map(c => (
          <motion.div 
            key={c.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFFFFF] rounded-2xl border-2 border-[#4CAF50] p-6 flex flex-col justify-between hover:border-[#007ACC] hover:shadow-xl hover:shadow-[#007ACC]/20 transition-all cursor-pointer group"
            onClick={() => openEditor(c)}
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#F4F4F4] border-2 border-[#4CAF50] rounded-xl flex items-center justify-center mb-6 text-[#007ACC] group-hover:bg-[#007ACC] group-hover:text-[#FFFFFF] transition-colors">
                {c.type === 'QUIZ' ? <ListChecks size={32} /> : <Code size={32} />}
              </div>
              <h4 className="text-xl font-black text-[#2C3E50] mb-2 line-clamp-1">{c.title}</h4>
              <div className="text-xs text-[#2C3E50] flex flex-wrap gap-2 font-bold tracking-wider uppercase mt-4">
                 <span className="inline-block px-4 py-2 rounded-lg bg-[#F4F4F4] border border-[#4CAF50] self-start">{c.type}</span>
                 <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#F4F4F4] border border-[#F4F4F4]">🎯 {c.totalPoints || 0} PTS</span>
                 <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#F4F4F4] border border-[#F4F4F4]">📋 {c.questions?.length || 0} ITEMS</span>
              </div>
            </div>
            <div className="pt-4 border-t-2 border-[#F4F4F4] flex items-center justify-end gap-3 mt-auto">
              <button onClick={(e) => { e.stopPropagation(); fetchSubmissions(c.id, c.url); }} className="text-[#007ACC] text-xs font-black uppercase flex items-center gap-1 bg-[#F4F4F4] px-4 py-2 rounded-xl border border-transparent hover:border-[#007ACC] hover:bg-[#007ACC]/10 transition-colors">
                <ListChecks size={14} /> Submissions
              </button>
              <button onClick={(e) => { e.stopPropagation(); openEditor(c); }} className="text-[#F0A500] hover:text-[#FFFFFF] hover:bg-[#F0A500] transition-colors bg-[#F0A500]/10 p-2 rounded-xl border border-transparent">
                <Edit3 size={16} />
              </button>
              <button onClick={(e) => handleDelete(e, c.id)} className="text-red-500 hover:text-[#FFFFFF] hover:bg-red-500 transition-colors bg-red-50 p-2 rounded-xl border border-transparent">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
        {list.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center p-12 bg-[#F4F4F4] rounded-2xl border-4 border-dashed border-[#4CAF50] text-[#2C3E50]/70 text-center">
              <Code size={40} className="text-[#007ACC] mb-4"/>
              <p className="text-xl font-black text-[#2C3E50]">No assessments found.</p>
              <p className="text-sm mt-2">Start by creating a new quiz or coding contest.</p>
           </div>
        )}
      </AnimatePresence>
    </div>
  );

  const avgScore = submissionsList.length ? Math.round(submissionsList.reduce((acc, sub) => acc + sub.totalPoints, 0) / submissionsList.length) : 0;
  const highScore = submissionsList.length ? Math.max(...submissionsList.map(s => s.totalPoints)) : 0;

  const filteredSubmissions = submissionsList
    .filter(sub => {
      const matchSearch = (sub.studentName || '').toLowerCase().includes(subSearch.toLowerCase()) || 
                          (sub.studentEmail || '').toLowerCase().includes(subSearch.toLowerCase());
      const passMin = subMinScore === '' || sub.totalPoints >= Number(subMinScore);
      const passMax = subMaxScore === '' || sub.totalPoints <= Number(subMaxScore);
      return matchSearch && passMin && passMax;
    })
    .sort((a, b) => {
      if (subSortBy === 'scoreDesc') return b.totalPoints - a.totalPoints;
      if (subSortBy === 'scoreAsc') return a.totalPoints - b.totalPoints;
      if (subSortBy === 'timeDesc') return new Date(b.finishTime) - new Date(a.finishTime);
      if (subSortBy === 'timeAsc') return new Date(a.finishTime) - new Date(b.finishTime);
      return 0;
    });

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) return;
    const headers = ['Student Name', 'Email', 'Total Score', 'Completion Time'];
    const rows = filteredSubmissions.map(sub => [
      `"${sub.studentName || 'Unknown'}"`,
      `"${sub.studentEmail}"`,
      sub.totalPoints,
      `"${new Date(sub.finishTime).toLocaleString()}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `submissions_${viewingAssessmentUrl || 'report'}.csv`;
    link.click();
  };

  if (view === 'home') {
    return (
      <>
      <div className="flex min-h-screen bg-slate-50 text-[#2C3E50] font-sans">
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
            <h2 className="text-2xl font-black text-brand-600 tracking-tight">Admin<span className="text-[#2C3E50]">Panel</span></h2>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <button onClick={() => {setSidebarView('overview'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'overview' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-[#2C3E50]'}`}>
              <LayoutDashboard size={20} /> Overview
            </button>
            <button onClick={() => {setSidebarView('contests'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'contests' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-[#2C3E50]'}`}>
              <Code size={20} /> Coding Contests
            </button>
            <button onClick={() => {setSidebarView('quizzes'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'quizzes' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-[#2C3E50]'}`}>
              <ListChecks size={20} /> Quizzes
            </button>
            <button onClick={() => {setSidebarView('history'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'history' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-[#2C3E50]'}`}>
              <History size={20} /> History
            </button>
            <button onClick={() => {setSidebarView('students'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${sidebarView === 'students' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50 hover:text-[#2C3E50]'}`}>
              <Users size={20} /> Onboard Students
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 w-full overflow-y-auto max-h-screen">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 mt-8 md:mt-0">
            <div>
              <h1 className="text-3xl font-extrabold text-[#2C3E50] tracking-tight capitalize">
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
                  <h2 className="text-xl font-bold text-[#2C3E50]">Active Coding Contests</h2>
                  <button onClick={() => setSidebarView('contests')} className="text-sm font-bold text-brand-600 hover:text-brand-800">View All</button>
                </div>
                {renderAssessmentList(activeContests.slice(0, 3))}
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#2C3E50]">Active Quizzes</h2>
                  <button onClick={() => setSidebarView('quizzes')} className="text-sm font-bold text-brand-600 hover:text-brand-800">View All</button>
                </div>
                {renderAssessmentList(activeQuizzes.slice(0, 3))}
              </section>
            </div>
          )}

          {sidebarView === 'contests' && (
             <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#2C3E50]">All Coding Contests</h2>
                {renderAssessmentList(activeContests)}
             </div>
          )}

          {sidebarView === 'quizzes' && (
             <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#2C3E50]">All Quizzes</h2>
                {renderAssessmentList(activeQuizzes)}
             </div>
          )}

          {sidebarView === 'history' && (
             <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#2C3E50]">Past Assessments</h2>
                {renderAssessmentList(historyList)}
             </div>
          )}

          {sidebarView === 'students' && (
            <div className="max-w-xl mx-auto mt-10 glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-brand-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">Student Onboarding</h3>
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

              <a href="#" onClick={(e) => { e.preventDefault(); setToastMessage({ title: 'Template downloading...', type: 'success' }); }} className="mt-6 text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors bg-brand-50 px-4 py-2 rounded-lg">
                <Download size={16} /> Download CSV Template
              </a>

              {/* Enhanced Students List UI */}
              <div className="w-full mt-10 text-left">
                <h4 className="text-lg font-bold text-[#2C3E50] mb-4 px-2">Onboarded Students Database</h4>
                <div className="bg-white border text-sm border-slate-200 rounded-xl max-h-64 overflow-y-auto w-full shadow-sm">
                   {studentsList.length > 0 ? (
                      <table className="w-full text-left">
                         <thead className="bg-slate-50 sticky top-0 font-bold text-slate-500 uppercase tracking-widest text-xs border-b border-slate-200">
                            <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email Address</th><th className="px-6 py-4">Verification</th></tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-medium">
                            {studentsList.map((stu, i) => (
                               <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 text-[#2C3E50]">{stu.fullName || 'Unregistered'}</td>
                                  <td className="px-6 py-4 text-slate-500">{stu.email}</td>
                                  <td className="px-6 py-4"><span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">Verified</span></td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   ) : (
                      <div className="p-8 text-center text-slate-500 font-medium text-sm">No students successfully onboarded yet.</div>
                   )}
                </div>
              </div>

            </div>
          )}

          {sidebarView === 'submissions' && (
             <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                      <button onClick={() => setSidebarView('overview')} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-[#2C3E50]"><ArrowLeft size={18} /></button>
                      <h2 className="text-2xl font-bold text-[#2C3E50]">Assessment Submissions</h2>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="font-bold bg-brand-50 text-brand-700 px-4 py-2 rounded-lg border border-brand-200 text-sm">Total Entries: {submissionsList.length}</span>
                      {submissionsList.length > 0 && (
                         <>
                            <span className="font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 text-sm hidden sm:inline-block">Avg Score: {avgScore}</span>
                            <span className="font-bold bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 text-sm hidden sm:inline-block">High Score: {highScore}</span>
                         </>
                      )}
                      <button onClick={exportToCSV} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm">
                         <Download size={16} /> Export CSV
                      </button>
                   </div>
                </div>

                {/* Filters Action Bar */}
                <div className="glass-panel p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
                   <div className="flex-1 w-full relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Search by name or email..." value={subSearch} onChange={e => setSubSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:border-brand-500 outline-none transition-colors" />
                   </div>
                   <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1 bg-slate-50">
                         <SlidersHorizontal size={14} className="text-slate-400" />
                         <input type="number" placeholder="Min Pts" value={subMinScore} onChange={e => setSubMinScore(e.target.value)} className="w-16 bg-transparent text-sm font-medium outline-none text-center placeholder-slate-400" />
                         <span className="text-slate-300">-</span>
                         <input type="number" placeholder="Max Pts" value={subMaxScore} onChange={e => setSubMaxScore(e.target.value)} className="w-16 bg-transparent text-sm font-medium outline-none text-center placeholder-slate-400" />
                      </div>
                      <select value={subSortBy} onChange={e => setSubSortBy(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold bg-slate-50 text-[#2C3E50] outline-none focus:border-brand-500">
                         <option value="scoreDesc">Highest Score</option>
                         <option value="scoreAsc">Lowest Score</option>
                         <option value="timeDesc">Newest First</option>
                         <option value="timeAsc">Oldest First</option>
                      </select>
                   </div>
                </div>

                <div className="glass-panel bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                   {filteredSubmissions.length > 0 ? (
                      <table className="w-full text-left">
                         <thead className="bg-slate-50 sticky top-0 font-bold text-slate-500 uppercase tracking-widest text-[10px] border-b border-slate-200">
                            <tr><th className="px-6 py-4">Student</th><th className="px-6 py-4">Email Address</th><th className="px-6 py-4">Total Score</th><th className="px-6 py-4 text-right">Completion Time (IST)</th></tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-bold text-sm">
                            {filteredSubmissions.map((sub, i) => (
                               <tr key={sub.id || i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 text-[#2C3E50] flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center border border-brand-200">{(sub.studentName?.[0] || 'U').toUpperCase()}</div>
                                     {sub.studentName || 'Unknown'}
                                  </td>
                                  <td className="px-6 py-4 text-slate-500 font-medium">{sub.studentEmail}</td>
                                  <td className="px-6 py-4 text-green-600">{sub.totalPoints} pts</td>
                                  <td className="px-6 py-4 text-right text-slate-500 font-medium">{new Date(sub.finishTime).toLocaleString()}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   ) : (
                      <div className="p-10 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">No candidates have taken this assessment yet.</div>
                   )}
                </div>
             </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel p-6 max-w-sm w-full relative">
              <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Delete Assessment</h3>
              <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete this assessment? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="btn-danger px-4 py-2 rounded-lg font-bold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">
            <div className={`px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 ${toastMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {toastMessage.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
              {toastMessage.title}
              <button onClick={() => setToastMessage(null)} className="ml-4 opacity-70 hover:opacity-100"><X size={14}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-10 p-4 md:p-8 max-w-5xl mx-auto z-10 relative text-[#2C3E50] font-sans pb-48">
      {/* STICKY TOPBAR */}
      <div className="sticky top-0 z-50 bg-[#F4F4F4] pt-8 pb-4 border-b-2 border-[#4CAF50]/30 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 -mx-4 shadow-sm md:px-8 md:-mx-8">
        <div>
          <button onClick={() => setView('home')} className="text-[#007ACC] flex items-center gap-1 mb-2 hover:underline text-sm font-black uppercase tracking-wider">
            <ArrowLeft size={16} /> Overview
          </button>
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#2C3E50] tracking-tight flex items-center gap-3">
            {type === 'QUIZ' ? <ListChecks size={28} className="text-[#007ACC]" /> : <Code size={28} className="text-[#007ACC]" />}
            {editingId ? (type === 'QUIZ' ? 'Edit Quiz' : 'Edit Contest') : (type === 'QUIZ' ? 'Quiz Creator' : 'Contest Creator')}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center bg-[#FFFFFF] p-1.5 rounded-xl border-2 border-[#4CAF50] shadow-sm overflow-x-auto">
            {['details', 'challenges'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg font-black transition-all duration-300 capitalize whitespace-nowrap ${activeTab === tab ? 'bg-[#007ACC] text-[#FFFFFF] shadow-md shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {activeTab === 'challenges' && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={addCodingProblem} 
                className="bg-[#007ACC] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#F0A500] transition-colors font-black uppercase tracking-widest text-xs hidden md:flex shadow-lg shadow-[#007ACC]/30"
              >
                <PlusCircle size={18} /> Add
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="glass-panel p-8 rounded-2xl bg-white shadow-lg shadow-slate-200/50">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#2C3E50]">
                <Globe className="text-brand-600" /> General Setup
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#2C3E50] mb-2">{type === 'QUIZ' ? 'Quiz Name' : 'Contest Name'}</label>
                  <input type="text" value={contestName} onChange={(e) => setContestName(e.target.value)} placeholder="Enter title..." className="premium-input w-full p-4 rounded-xl text-lg font-bold placeholder-slate-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E50] mb-2">Max Valid Attempts</label>
                    <input type="number" min="1" value={maxAttempts} onChange={(e) => setMaxAttempts(Math.max(1, e.target.value))} className="premium-input w-full p-4 rounded-xl font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E50] mb-2">Start Time (IST)</label>
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="premium-input w-full p-4 rounded-xl font-medium" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-[#2C3E50] mb-2">
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
            <button onClick={addCodingProblem} className="w-full bg-[#FFFFFF] border-2 border-dashed border-[#007ACC] py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#F4F4F4] text-[#007ACC] transition-all font-black uppercase tracking-widest text-xs md:hidden mb-6">
               <PlusCircle size={18} /> Add New Challenge
            </button>

            {questions.map((q, index) => (
              <div key={index} className="glass-panel p-8 rounded-2xl relative border-l-4 border-l-brand-500 bg-white shadow-md">
                <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 hover:bg-red-50 rounded-lg">
                  <Trash2 size={20} />
                </button>

                <div className="mb-6 flex flex-col lg:flex-row gap-6 pr-10">
                  <div className="flex-1 space-y-5">
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">{type === 'QUIZ' ? 'Question Name *' : 'Challenge Name *'}</label>
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
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] flex justify-end items-center gap-4 pointer-events-none">
        {publishSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-brand-700 flex items-center gap-2 font-bold bg-brand-100 border border-brand-300 px-6 py-3 rounded-2xl shadow-xl pointer-events-auto">
            <CheckCircle2 size={20} /> {type === 'QUIZ' ? 'Quiz' : 'Contest'} Saved!
          </motion.div>
        )}
        <button
          onClick={handlePublish}
          disabled={!contestName || isPublishing || questions.length === 0}
          className={`btn-primary px-8 py-3.5 rounded-xl font-black tracking-wider uppercase text-sm flex items-center gap-3 transition-all shadow-xl pointer-events-auto ${(!contestName || isPublishing || questions.length === 0) ? 'opacity-50 cursor-not-allowed bg-slate-300 shadow-none text-slate-500' : 'hover:-translate-y-1 hover:shadow-brand-500/30'}`}
        >
          {isPublishing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
          {editingId ? (type === 'QUIZ' ? 'Update Quiz' : 'Update Contest') : (type === 'QUIZ' ? 'Publish Quiz' : 'Publish Contest')}
        </button>
      </div>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-panel p-6 max-w-sm w-full relative pointer-events-auto">
              <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Delete Assessment</h3>
              <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete this assessment? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="btn-danger px-4 py-2 rounded-lg font-bold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
            <div className={`px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 ${toastMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {toastMessage.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
              {toastMessage.title}
              <button onClick={() => setToastMessage(null)} className="ml-4 opacity-70 hover:opacity-100"><X size={14}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}