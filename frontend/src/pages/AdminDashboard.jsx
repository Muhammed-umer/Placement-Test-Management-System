import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Save, PlusCircle, Trash2, Code, CheckCircle2,
  ArrowLeft, ArrowRight, RefreshCw, Settings, ListChecks, Edit3, UploadCloud, Download,
  LayoutDashboard, History, Menu, X, Users, Search, SlidersHorizontal, BarChart3, Sparkles, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
const StudentProfileModal = ({ student, onClose }) => {
  if (!student) return null;

  const LinkIcon = ({ href, label, icon: Icon }) => (
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all font-bold text-sm">
        {Icon && <Icon size={18} />}
        {label}
      </a>
    ) : null
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2C3E50]/60 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl shadow-brand-500/20 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#007ACC] to-brand-500 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-md">
             <X size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-black text-[#007ACC] shadow-inner">
               {(student.fullName?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">{student.fullName || 'Student'}</h2>
              <p className="text-brand-100 font-medium text-lg opacity-90">{student.email}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/30">
                <Users size={16} /> Verified {student.role || 'STUDENT'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <h3 className="text-xl font-black border-b-2 border-slate-100 pb-2 text-[#2C3E50] flex items-center gap-2">
                 <History size={20} className="text-[#007ACC]" /> Academic Details
              </h3>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                 <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500">CGPA</span><span className="font-black text-[#2C3E50]">{student.cgpa || 'N/A'}</span></div>
                 <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500">12th Grade</span><span className="font-black text-[#2C3E50]">{student.twelfthGradeMarks ? `${student.twelfthGradeMarks}%` : 'N/A'}</span></div>
                 <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500">10th Grade</span><span className="font-black text-[#2C3E50]">{student.tenthGradeMarks ? `${student.tenthGradeMarks}%` : 'N/A'}</span></div>
                 <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500">Department</span><span className="font-black text-[#2C3E50]">{student.department || 'N/A'}</span></div>
                 <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500">Graduation Year</span><span className="font-black text-[#2C3E50]">{student.graduatingYear || 'N/A'}</span></div>
              </div>
           </div>
           
           <div className="space-y-6">
              <h3 className="text-xl font-black border-b-2 border-slate-100 pb-2 text-[#2C3E50] flex items-center gap-2">
                 <Globe size={20} className="text-[#007ACC]" /> Coding Profiles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <LinkIcon href={student.leetCodeLink} label="LeetCode" icon={Code} />
                 <LinkIcon href={student.githubLink} label="GitHub" icon={Code} />
                 <LinkIcon href={student.hackerrankLink} label="HackerRank" icon={Code} />
                 <LinkIcon href={student.codechefLink} label="CodeChef" icon={Code} />
                 <LinkIcon href={student.linkedinLink} label="LinkedIn" icon={Globe} />
                 {(!student.leetCodeLink && !student.githubLink && !student.hackerrankLink && !student.codechefLink && !student.linkedinLink) && (
                    <div className="col-span-2 p-4 text-center text-sm font-bold text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                      No linked profiles available.
                    </div>
                 )}
              </div>
              
              <h3 className="text-xl font-black border-b-2 border-slate-100 pb-2 text-[#2C3E50] flex items-center gap-2 mt-8">
                 <ListChecks size={20} className="text-[#007ACC]" /> Achievements
              </h3>
              <div className="bg-brand-50/50 p-5 rounded-2xl border border-brand-100 text-sm font-medium text-[#2C3E50]">
                 {student.achievements ? student.achievements.split('\n').map((ach, i) => (
                    <div key={i} className="flex gap-2 mb-2 last:mb-0"><div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />{ach}</div>
                 )) : <span className="text-slate-400 italic font-bold">No achievements listed.</span>}
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('home');
  const [sidebarView, setSidebarView] = useState('overview'); // overview, contests, quizzes, history, students
  const [activeTab, setActiveTab] = useState('details');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(sessionStorage.getItem('role') || '');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminsList, setAdminsList] = useState([]);

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

  // AI Generation State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(1);
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [aiNumTestCases, setAiNumTestCases] = useState(5);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiContext, setAiContext] = useState('');

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setToastMessage({ title: 'Extracting PDF text...', type: 'success' });
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
         const page = await pdf.getPage(i);
         const textContent = await page.getTextContent();
         fullText += textContent.items.map(s => s.str).join(' ') + '\n';
      }
      setAiContext(fullText.substring(0, 15000));
      setToastMessage({ title: 'PDF extracted! Ready to generate.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMessage({ title: 'Failed to extract PDF.', type: 'error' });
    }
  };

  const generateQuestionsWithAI = async () => {
    if(!aiTopic) return setToastMessage({ title: 'Topic is required', type: 'error' });
    setIsAiGenerating(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/v1/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
            topic: aiTopic,
            numQuestions: Number(aiCount),
            difficulty: aiDifficulty,
            type: type,
            context: aiContext,
            numTestCases: type === 'CODING' ? Number(aiNumTestCases) : 0
        })
      });
      if(res.ok) {
        const generated = await res.json();
        if(Array.isArray(generated)) {
            setQuestions([...questions, ...generated]);
            setToastMessage({ title: 'AI successfully generated questions!', type: 'success' });
            setAiModalOpen(false);
        } else {
            setToastMessage({ title: 'Unexpected AI response format.', type: 'error' });
        }
      } else {
        setToastMessage({ title: 'AI generation failed.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToastMessage({ title: 'AI request failed. Ensure backend is running.', type: 'error' });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminEmailInput || !adminEmailInput.includes('@')) {
      return setToastMessage({ title: 'Please enter a valid email address.', type: 'error' });
    }
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/v1/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email: adminEmailInput })
      });
      if (res.ok) {
        setToastMessage({ title: 'Admin created successfully. Default password is Admin@123', type: 'success' });
        setAdminEmailInput('');
        fetchAdmins();
      } else {
        const err = await res.text();
        setToastMessage({ title: err || 'Failed to create admin.', type: 'error' });
      }
    } catch (e) {
      setToastMessage({ title: 'Error creating admin.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fileInputRef = useRef(null);

  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setQuestions([...questions, ...data]);
          setToastMessage({ title: "Successfully bulk imported challenges!", type: 'success' });
        } else {
          setToastMessage({ title: "Invalid JSON format. Must be an array of questions.", type: 'error' });
        }
      } catch (err) {
        setToastMessage({ title: "Failed to parse JSON file.", type: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = null; // reset input
  };

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
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/v1/admin/students', {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) setStudentsList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchAdmins = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:8081/api/v1/admin/admins', {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) setAdminsList(await res.json());
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
    if (sidebarView === 'admins') {
      fetchAdmins();
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
      
      // Helper to convert ISO string to YYYY-MM-DDTHH:mm
      const toLocalISO = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Correct for timezone offset to get local "T" notation
        const offset = date.getTimezoneOffset() * 60000;
        return (new Date(date - offset)).toISOString().slice(0, 16);
      };

      setStartTime(toLocalISO(contest.startTime));
      setEndTime(toLocalISO(contest.endTime));
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

  const addQuestion = () => {
    if (type === 'QUIZ') {
      setQuestions([...questions, {
        questionType: 'MCQ',
        title: '',
        description: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 10
      }]);
    } else {
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
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) updated[questionIndex].options = [];
    updated[questionIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.splice(optionIndex, 1);
    // if the removed option was the correct answer, clear the correct answer
    if (updated[questionIndex].correctAnswer && !updated[questionIndex].options.includes(updated[questionIndex].correctAnswer)) {
      updated[questionIndex].correctAnswer = '';
    }
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
    const hasInvalidChallenge = questions.some(q => {
      if (type === 'QUIZ') {
        // Validation for Quiz questions
        return !q.title || !q.options || q.options.length < 2 || !q.correctAnswer;
      } else {
        // Validation for Coding problems
        return !q.title || !q.description || !q.inputFormat || !q.outputFormat || !q.constraints || q.testCases.length === 0;
      }
    });

    if (questions.length === 0) {
      setToastMessage({ title: "Please add at least one question or challenge.", type: 'error' });
      return;
    }

    if (hasInvalidChallenge) {
      const msg = type === 'QUIZ' 
        ? "Please ensure all quiz questions have titles, at least 2 options, and a correct answer selected."
        : "Please ensure all challenge details are filled and at least one test case is added for every challenge.";
      setToastMessage({ title: msg, type: 'error' });
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
      startTime: startTime ? (startTime.length === 16 ? startTime + ':00' : startTime) : null,
      endTime: (endTime && !noEndTime) ? (endTime.length === 16 ? endTime + ':00' : endTime) : null,
      url: contestUrl,
      allowedLanguages: ['cpp', 'java', 'python', 'c'],
      questions: questions.map(q => ({
        ...q,
        points: Number(q.points) || 0,
        questionType: q.type || q.questionType || 'CODING'
      }))
    };

    try {
      const token = sessionStorage.getItem('token');
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
          <div className="flex items-center justify-center h-20 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-2xl font-black tracking-tight text-[#007ACC]">Admin<span className="text-[#2C3E50]">Panel</span></h2>
          </div>
          <div className="flex justify-center gap-4 py-4 border-b-4 border-[#F4F4F4] bg-white z-10 sticky top-0">
             <button onClick={() => window.history.back()} className="p-2.5 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm cursor-pointer border border-[#4CAF50]" title="Go Back">
                <ArrowLeft size={18} />
             </button>
             <button onClick={() => window.location.reload()} className="p-2.5 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm cursor-pointer border border-[#4CAF50]" title="Refresh">
                <RefreshCw size={18} />
             </button>
             <button onClick={() => window.history.forward()} className="p-2.5 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm cursor-pointer border border-[#4CAF50]" title="Go Forward">
                <ArrowRight size={18} />
             </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto w-full">
            <button onClick={() => {setSidebarView('overview'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${sidebarView === 'overview' ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
              <LayoutDashboard size={20} /> Overview
            </button>
            <button onClick={() => {setSidebarView('contests'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${sidebarView === 'contests' ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
              <Code size={20} /> Coding Contests
            </button>
            <button onClick={() => {setSidebarView('quizzes'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${sidebarView === 'quizzes' ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
              <ListChecks size={20} /> Quizzes
            </button>
            <button onClick={() => {setSidebarView('history'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${sidebarView === 'history' ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
              <History size={20} /> History
            </button>
            <button onClick={() => {
              setSidebarView('analytics'); 
              setIsSidebarOpen(false);
              fetchStudents(); // Make sure students are loaded for analytics
            }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${sidebarView === 'analytics' ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
              <BarChart3 size={20} /> Analytics
            </button>
            <button onClick={() => {setSidebarView('students'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${sidebarView === 'students' ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
              <Users size={20} /> Onboard Students
            </button>
            {userRole === 'ROLE_SUPER_ADMIN' && (
              <button onClick={() => {setSidebarView('admins'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${sidebarView === 'admins' ? 'bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}>
                <ShieldAlert size={20} /> Manage Admins
              </button>
            )}
            <div className="pt-6 mt-4 border-t-2 border-[#F4F4F4]">
              <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors">
                <X size={20} /> Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 w-full overflow-y-auto max-h-screen relative z-10 pb-20">
          
          {/* AI Generation Modal overlay outside view switcher */}
          <AnimatePresence>
            {aiModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[#2C3E50]/60 backdrop-blur-sm" onClick={() => setAiModalOpen(false)}></div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-10 border border-[#007ACC]/20">
                  <button onClick={() => setAiModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007ACC] to-brand-500 flex items-center justify-center text-white shadow-lg shadow-[#007ACC]/30">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-[#2C3E50]">AI Generator</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#2C3E50] mb-1">Topic</label>
                      <input type="text" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. Binary Trees, OOP concepts..." className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007ACC]" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-[#2C3E50] mb-1">Count</label>
                        <input type="number" min="1" max="100" value={aiCount} onChange={e => setAiCount(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007ACC]" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-[#2C3E50] mb-1">Difficulty</label>
                        <select value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007ACC] bg-white">
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                    </div>
                    {type === 'CODING' && (
                      <div>
                        <label className="block text-sm font-bold text-[#2C3E50] mb-1">Number of Test Cases (Min: 5)</label>
                        <input type="number" min="5" value={aiNumTestCases} onChange={e => setAiNumTestCases(Math.max(5, e.target.value))} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007ACC]" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-[#2C3E50] mb-1">Context (Optional PDF)</label>
                      <div className="relative">
                        <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" id="ai-pdf-upload-admin" />
                        <label htmlFor="ai-pdf-upload-admin" className="w-full p-3 rounded-xl border border-slate-200 border-dashed cursor-pointer flex items-center justify-between text-sm hover:border-[#007ACC] transition-colors">
                           <span className="text-[#2C3E50]/70 truncate">{aiContext ? 'PDF Parsed Successfully!' : 'Click to select PDF document'}</span>
                           <UploadCloud size={18} className="text-[#007ACC]" />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={generateQuestionsWithAI} disabled={isAiGenerating} className={`mt-6 w-full py-3 rounded-xl font-black text-white uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all ${isAiGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#007ACC] to-brand-500 hover:shadow-lg hover:shadow-[#007ACC]/30'}`}>
                    {isAiGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
                    {isAiGenerating ? 'Generating...' : 'Generate Magic'}
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {view === 'home' ? (
            <>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full">
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
            <div className="w-full flex flex-col gap-8">
              {/* Top Section: Upload */}
              <div className="max-w-xl mx-auto mt-4 glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center w-full">
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
              </div>

              {/* Bottom Section: Enhanced Full Width Students Database */}
              <div className="w-full mt-4 glass-panel p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                   <h4 className="text-xl font-bold text-[#2C3E50] flex items-center gap-2">
                     <Users size={20} className="text-brand-600" /> Onboarded Students
                   </h4>
                   <div className="flex items-center gap-3 w-full md:w-auto">
                     <div className="relative w-full md:w-64">
                       <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Search students..." 
                         className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-brand-500 outline-none"
                         onChange={(e) => {
                           /* Quick inline filtering */
                           const val = e.target.value.toLowerCase();
                           const rows = document.querySelectorAll('.student-row');
                           rows.forEach(row => {
                             const text = row.textContent.toLowerCase();
                             row.style.display = text.includes(val) ? '' : 'none';
                           });
                         }}
                       />
                     </div>
                   </div>
                </div>

                <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-x-auto w-full shadow-sm">
                   {studentsList.length > 0 ? (
                      <table className="w-full text-left whitespace-nowrap">
                         <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-[10px] md:text-xs border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4">Name</th>
                              <th className="px-6 py-4">Email Address</th>
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-medium cursor-pointer">
                            {studentsList.map((stu, i) => (
                               <tr key={i} onClick={() => setSelectedStudent(stu)} className="hover:bg-slate-100 transition-colors student-row">
                                  <td className="px-6 py-4 text-[#2C3E50] font-bold">{stu.fullName || 'Unregistered'}</td>
                                  <td className="px-6 py-4 text-slate-500">{stu.email || 'N/A'}</td>
                                  <td className="px-6 py-4">
                                     <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-wide uppercase border border-blue-100">
                                       {stu.role || 'STUDENT'}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className="bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-wide uppercase border border-green-100">Verified</span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   ) : (
                      <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                        <Users size={48} className="mb-4 text-slate-300" />
                        <span className="font-bold text-lg text-slate-500">No students onboarded yet</span>
                        <p className="text-sm mt-1">Upload an Excel file above to add students to the database.</p>
                      </div>
                   )}
                </div>
              </div>
            </div>
          )}

          {sidebarView === 'analytics' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-black text-[#2C3E50] flex items-center gap-2">
                  <BarChart3 size={28} className="text-[#007ACC]" /> Platform Analytics 
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                   <div className="bg-[#FFFFFF] p-8 rounded-3xl flex flex-col justify-center items-center border-2 border-[#4CAF50] shadow-xl hover:shadow-[#007ACC]/20 hover:border-[#007ACC] transition-all">
                     <div className="w-16 h-16 bg-[#F4F4F4] rounded-2xl flex items-center justify-center mb-6 text-[#007ACC]">
                       <Users size={32} />
                     </div>
                     <div className="text-5xl font-black text-[#2C3E50]">{studentsList.length}</div>
                     <div className="text-xs font-bold text-[#007ACC] tracking-widest uppercase mt-4 bg-[#007ACC]/10 px-4 py-1.5 rounded-full border border-[#007ACC]/20">Registered Students</div>
                   </div>
                   <div className="bg-[#FFFFFF] p-8 rounded-3xl flex flex-col justify-center items-center border-2 border-[#4CAF50] shadow-xl hover:shadow-[#007ACC]/20 hover:border-[#007ACC] transition-all">
                     <div className="w-16 h-16 bg-[#F4F4F4] rounded-2xl flex items-center justify-center mb-6 text-[#007ACC]">
                       <Code size={32} />
                     </div>
                     <div className="text-5xl font-black text-[#2C3E50]">{contests.length}</div>
                     <div className="text-xs font-bold text-[#007ACC] tracking-widest uppercase mt-4 bg-[#007ACC]/10 px-4 py-1.5 rounded-full border border-[#007ACC]/20">Total Assessments</div>
                   </div>
                   <div className="bg-[#FFFFFF] p-8 rounded-3xl flex flex-col justify-center items-center border-2 border-[#4CAF50] shadow-xl hover:shadow-[#007ACC]/20 hover:border-[#007ACC] transition-all">
                     <div className="w-16 h-16 bg-[#F4F4F4] rounded-2xl flex items-center justify-center mb-6 text-[#007ACC]">
                       <ListChecks size={32} />
                     </div>
                     <div className="text-5xl font-black text-[#2C3E50]">{contests.filter(c => c.type === 'QUIZ').length}</div>
                     <div className="text-xs font-bold text-[#007ACC] tracking-widest uppercase mt-4 bg-[#007ACC]/10 px-4 py-1.5 rounded-full border border-[#007ACC]/20">Total Quizzes</div>
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
                      <div className="relative">
                        <select value={subSortBy} onChange={e => setSubSortBy(e.target.value)} className="appearance-none bg-[#FFFFFF] border-2 border-[#4CAF50] text-[#2C3E50] font-black text-xs pl-4 pr-10 py-2.5 rounded-xl outline-none focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/20 transition-all cursor-pointer shadow-sm hover:border-[#007ACC]">
                           <option value="scoreDesc">Highest Score</option>
                           <option value="scoreAsc">Lowest Score</option>
                           <option value="timeDesc">Newest First</option>
                           <option value="timeAsc">Oldest First</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#2C3E50]">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                      </div>
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

          {sidebarView === 'admins' && userRole === 'ROLE_SUPER_ADMIN' && (
             <div className="space-y-8">
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-[#4CAF50] shadow-sm bg-white">
                   <div className="flex items-center gap-3">
                      <ShieldAlert size={28} className="text-[#F0A500]" />
                      <h2 className="text-2xl font-black text-[#2C3E50]">Superadmin Access</h2>
                   </div>
                   <p className="text-sm font-bold text-slate-500">Create new admin accounts. Newly created admins will automatically use the default password <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded">Admin@123</span></p>
                   <div className="flex flex-col md:flex-row gap-4 mt-2">
                      <input type="email" placeholder="Enter new admin email (e.g. admin2@gcee.ac.in)" value={adminEmailInput} onChange={e => setAdminEmailInput(e.target.value)} className="flex-1 w-full bg-[#F4F4F4] border border-slate-200 focus:border-[#007ACC] p-4 rounded-xl text-sm font-bold outline-none" />
                      <button onClick={handleCreateAdmin} className="bg-gradient-to-r from-[#007ACC] to-brand-500 text-white font-black hover:shadow-lg hover:shadow-[#007ACC]/30 px-6 py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all shadow-[#007ACC]/20 whitespace-nowrap">
                         <PlusCircle size={18} /> Create Admin
                      </button>
                   </div>
                </div>

                <div className="glass-panel bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                   <h3 className="text-xl font-bold text-[#2C3E50] mb-6 flex items-center gap-2"><Users size={20} className="text-[#007ACC]" /> Platform Admins</h3>
                   <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                      <table className="w-full text-left">
                         <thead className="bg-slate-100 font-bold text-slate-500 uppercase tracking-widest text-[10px] border-b border-slate-200">
                            <tr><th className="px-6 py-4">Admin Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th></tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-bold text-sm">
                            {adminsList.map((adm, i) => (
                               <tr key={i} className="hover:bg-white transition-colors">
                                  <td className="px-6 py-4 text-[#2C3E50]">{adm.email}</td>
                                  <td className="px-6 py-4">
                                     <span className={`px-3 py-1 rounded-full text-[10px] tracking-wide uppercase border ${adm.role === 'ROLE_SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                       {adm.role}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className="bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-wide uppercase border border-green-100">Active</span>
                                  </td>
                               </tr>
                            ))}
                            {adminsList.length === 0 && (
                               <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">Loading admins...</td></tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          )}
          </motion.div>
          </>
          ) : (
             <div className="w-full relative z-10 max-w-5xl mx-auto">
                {/* STICKY TOPBAR */}
                <div className="sticky top-0 z-50 bg-[#F4F4F4]/90 backdrop-blur-sm pt-4 pb-4 border-b-2 border-[#4CAF50]/30 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 -mx-4 shadow-sm md:px-8 md:-mx-8">
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
            {['details', type === 'QUIZ' ? 'questions' : 'challenges'].map(tab => (
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
            {activeTab === (type === 'QUIZ' ? 'questions' : 'challenges') && (
              <div className="flex gap-2">
                <motion.button 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setAiModalOpen(true)} 
                  className="bg-gradient-to-r from-[#007ACC] to-brand-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg transition-colors font-black uppercase tracking-widest text-xs shadow-[#007ACC]/30 border border-transparent"
                >
                  <Sparkles size={18} /> Auto-Generate
                </motion.button>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleBulkUpload} className="hidden" />
                <motion.button 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => fileInputRef.current.click()} 
                  className="bg-[#FFFFFF] text-[#007ACC] border-2 border-[#007ACC] px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#F4F4F4] transition-colors font-black uppercase tracking-widest text-xs shadow-lg shadow-[#007ACC]/20"
                >
                  <UploadCloud size={18} /> Bulk JSON
                </motion.button>
                <motion.button 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  onClick={addQuestion} 
                  className="bg-[#007ACC] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#F0A500] transition-colors font-black uppercase tracking-widest text-xs shadow-lg shadow-[#007ACC]/30"
                >
                  <PlusCircle size={18} /> Add
                </motion.button>
              </div>
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

        {activeTab === (type === 'QUIZ' ? 'questions' : 'challenges') && (
          <motion.div key="challenges" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-20">
            <button onClick={addQuestion} className="w-full bg-[#FFFFFF] border-2 border-dashed border-[#007ACC] py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#F4F4F4] text-[#007ACC] transition-all font-black uppercase tracking-widest text-xs md:hidden mb-6">
               <PlusCircle size={18} /> Add New {type === 'QUIZ' ? 'Question' : 'Challenge'}
            </button>

            {questions.map((q, index) => (
              <div key={index} className="glass-panel p-8 rounded-2xl relative border-l-4 border-l-brand-500 bg-white shadow-md">
                <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-50 hover:bg-red-50 rounded-lg">
                  <Trash2 size={20} />
                </button>

                <div className="mb-6 flex flex-col lg:flex-row gap-6 pr-10">
                  <div className="flex-1 space-y-5">
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">{type === 'QUIZ' ? 'Question Title *' : 'Challenge Name *'}</label>
                      <input type="text" placeholder={type === 'QUIZ' ? 'Enter your question...' : 'Title'} value={q.title} onChange={(e) => updateQuestion(index, 'title', e.target.value)} className="premium-input w-full p-3.5 rounded-xl font-bold placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Description *</label>
                      <textarea placeholder={type === 'QUIZ' ? 'Question description...' : 'Problem statement...'} value={q.description} onChange={(e) => updateQuestion(index, 'description', e.target.value)} className="premium-input w-full p-4 rounded-xl h-32 text-sm font-mono placeholder-slate-400" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 w-48">
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Score Points</label>
                    <input type="number" value={q.points} onChange={e => updateQuestion(index, 'points', e.target.value)} className="premium-input p-3 rounded-xl font-bold text-lg" />
                  </div>
                </div>

                {type === 'QUIZ' ? (
                  // MCQ Question Fields
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Options *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{String.fromCharCode(65 + optIndex)}</span>
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              value={option}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[index].options[optIndex] = e.target.value;
                                setQuestions(updated);
                              }}
                              className="premium-input flex-1 p-3 rounded-xl"
                            />
                            {q.options.length > 2 && (
                              <button onClick={() => removeOption(index, optIndex)} className="text-red-500 hover:text-red-700 p-2">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addOption(index)} className="mt-3 text-brand-600 hover:text-brand-800 text-sm font-bold flex items-center gap-1">
                        <PlusCircle size={16} /> Add Option
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Correct Answer *</label>
                      <select
                        value={q.correctAnswer || ''}
                        onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                        className="premium-input w-full p-3 rounded-xl"
                      >
                        <option value="">Select correct answer</option>
                        {q.options?.map((option, optIndex) => (
                          <option key={optIndex} value={option}>{String.fromCharCode(65 + optIndex)}) {option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  // Coding Problem Fields
                  <>
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
                          <Settings size={18} /> Test Case Manager ({q.testCases?.length || 0})
                        </h3>
                        <button onClick={() => addTestCase(index)} className="text-xs bg-brand-50 text-brand-700 px-4 py-2 rounded-lg border border-brand-200 hover:bg-brand-100 transition-all flex items-center gap-1 font-bold">
                          <PlusCircle size={16} /> Add Test Case
                        </button>
                      </div>

                      <div className="space-y-4">
                        {q.testCases?.map((tc, tcIdx) => (
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
                        {(!q.testCases || q.testCases.length === 0) && (
                          <div className="text-center py-6 border-2 border-dashed border-red-200 bg-red-50/50 rounded-2xl">
                            <p className="text-sm text-red-600 font-bold">No test cases added. At least one is mandatory to publish.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
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