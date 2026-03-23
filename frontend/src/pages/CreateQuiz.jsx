import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Save, PlusCircle, Trash2, ListChecks, CheckCircle2, ArrowLeft, ArrowRight, RefreshCw, UploadCloud,
  Menu, X, LayoutDashboard, Code, History, Users, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
export default function CreateQuiz() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [contestName, setContestName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [noEndTime, setNoEndTime] = useState(false);
  const [contestUrl, setContestUrl] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(1);

  const [questions, setQuestions] = useState([]);


  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  // AI Generation State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
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
      setAiContext(fullText.substring(0, 15000)); // Take up to ~15k chars
      setToastMessage({ title: 'PDF extracted! Ready to generate.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMessage({ title: 'Failed to extract PDF.', type: 'error' });
    }
  };

  const generateQuestionsWithAI = async () => {
    if (!aiTopic) return setToastMessage({ title: 'Topic is required', type: 'error' });
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
          type: 'QUIZ',
          context: aiContext
        })
      });
      if (res.ok) {
        const generated = await res.json();
        if (Array.isArray(generated)) {
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
      setToastMessage({ title: 'AI request failed.', type: 'error' });
    } finally {
      setIsAiGenerating(false);
    }
  };

  useEffect(() => {
    if (contestName) {
      setContestUrl(`${window.location.origin}/assessment/PENDING-ID`);
    } else {
      setContestUrl('');
    }
  }, [contestName]);

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
          setToastMessage("Successfully bulk imported questions!");
        } else {
          setToastMessage("Invalid JSON format. Must be an array of questions.");
        }
      } catch (err) {
        setToastMessage("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = null; // reset input
  };

  const addQuizQuestion = () => {
    setQuestions([...questions, {
      questionType: 'MCQ',
      title: '',
      description: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
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

  const handlePublish = async () => {
    const isInvalid = questions.some(q => !q.correctAnswer || !q.title);
    if (isInvalid) {
      setToastMessage({ title: "Please ensure all questions have a title and a correct answer marked.", type: 'error' });
      return;
    }

    setIsPublishing(true);
    const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0);
    let durationMinutes = 60;
    if (startTime && endTime && !noEndTime) {
      const mDiff = (new Date(endTime) - new Date(startTime)) / 60000;
      durationMinutes = Math.abs(mDiff);
    }

    const payload = {
      title: contestName,
      description: `Quiz ID: ${contestUrl}`,
      type: 'QUIZ',
      totalPoints: totalPoints || 0,
      durationMinutes: durationMinutes || 60,
      maxAttempts: Number(maxAttempts) || 1,
      startTime: startTime ? (startTime.length === 16 ? startTime + ':00' : startTime) : null,
      endTime: (endTime && !noEndTime) ? (endTime.length === 16 ? endTime + ':00' : endTime) : null,
      url: contestUrl,
      questions: questions.map(q => ({
        ...q,
        points: Number(q.points)
      })),
      allowedLanguages: []
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
        setTimeout(() => {
          setPublishSuccess(false);
          navigate('/admin');
        }, 2000);
      }
    } catch (e) {
      console.error('Error publishing', e);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#2C3E50] font-sans">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
      >
        {isSidebarOpen ? <X size={24} className="text-slate-600" /> : <Menu size={24} className="text-slate-600" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-72 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-20 border-b border-slate-100">
          <h2 className="text-2xl font-black text-brand-600 tracking-tight">Admin<span className="text-[#2C3E50]">Panel</span></h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          <button onClick={() => navigate('/admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]`}>
            <LayoutDashboard size={20} /> Overview
          </button>
          <button onClick={() => navigate('/admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]`}>
            <Code size={20} /> Coding Contests
          </button>
          <button onClick={() => { }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all bg-[#007ACC] text-white shadow-lg shadow-[#007ACC]/30`}>
            <ListChecks size={20} /> Quizzes
          </button>
          <button onClick={() => navigate('/admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]`}>
            <History size={20} /> History
          </button>
          <button onClick={() => navigate('/admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]`}>
            <Users size={20} /> Onboard Students
          </button>
          <div className="pt-6 mt-4 border-t-2 border-[#F4F4F4] flex justify-center gap-4">
            <button onClick={() => window.history.back()} className="p-3 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm cursor-pointer" title="Go Back">
              <ArrowLeft size={18} />
            </button>
            <button onClick={() => window.location.reload()} className="p-3 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm cursor-pointer" title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => window.history.forward()} className="p-3 rounded-xl bg-[#F4F4F4] text-[#2C3E50] hover:bg-[#007ACC] hover:text-[#FFFFFF] transition-colors shadow-sm cursor-pointer" title="Go Forward">
              <ArrowRight size={18} />
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 w-full overflow-y-auto max-h-screen relative z-10 pb-20">

        {/* AI Generation Modal */}
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
                    <input type="text" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. JavaScript Closures..." className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007ACC]" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-[#2C3E50] mb-1">Questions</label>
                      <input type="number" min="1" max="20" value={aiCount} onChange={e => setAiCount(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007ACC]" />
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
                  <div>
                    <label className="block text-sm font-bold text-[#2C3E50] mb-1">Context (Optional PDF)</label>
                    <div className="relative">
                      <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" id="ai-pdf-upload" />
                      <label htmlFor="ai-pdf-upload" className="w-full p-3 rounded-xl border border-slate-200 border-dashed cursor-pointer flex items-center justify-between text-sm hover:border-[#007ACC] transition-colors">
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

        <div className="max-w-5xl mx-auto">
          {/* STICKY TOPBAR */}
          <div className="sticky top-0 z-50 bg-[#F4F4F4]/90 backdrop-blur-sm pt-4 pb-4 border-b-2 border-[#4CAF50]/30 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 -mx-4 shadow-sm md:px-8 md:-mx-8">
            <div>
              <button onClick={() => navigate('/admin')} className="text-[#007ACC] flex items-center gap-1 mb-2 hover:underline text-sm font-black uppercase tracking-wider">
                <ArrowLeft size={16} /> Overview
              </button>
              <h1 className="text-2xl md:text-4xl font-extrabold text-[#2C3E50] tracking-tight flex items-center gap-3">
                <ListChecks size={28} className="text-[#007ACC]" /> Quiz Builder
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center bg-[#FFFFFF] p-1.5 rounded-xl border-2 border-[#4CAF50] shadow-sm">
                {['details', 'questions'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg font-black transition-all duration-300 capitalize whitespace-nowrap ${activeTab === tab ? 'bg-[#007ACC] text-white shadow-md' : 'text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#F4F4F4]'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {activeTab === 'questions' && (
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
                      onClick={addQuizQuestion}
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
                <div className="glass-panel p-8 rounded-2xl border border-[#4CAF50]/50 shadow-2xl relative overflow-hidden">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Globe className="text-[#007ACC]" /> General Setup
                  </h2>
                  <div className="space-y-5 relative z-10">
                    <div>
                      <label className="block text-sm font-medium text-[#2C3E50] mb-2 font-bold tracking-wider">Quiz Name</label>
                      <input type="text" value={contestName} onChange={(e) => setContestName(e.target.value)} placeholder="e.g., Midterm Evaluation" className="premium-input w-full p-4 rounded-xl text-lg font-semibold" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-[#2C3E50] mb-2 font-bold tracking-wider">Max Valid Attempts</label>
                        <input type="number" min="1" value={maxAttempts} onChange={(e) => setMaxAttempts(Math.max(1, e.target.value))} className="premium-input w-full p-4 rounded-xl text-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#2C3E50] mb-2 font-bold tracking-wider">Start Time (IST)</label>
                        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="premium-input w-full p-4 rounded-xl" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#2C3E50] mb-2 font-bold tracking-wider">
                          End Time (IST)
                          <input type="checkbox" checked={noEndTime} onChange={e => setNoEndTime(e.target.checked)} className="ml-2 accent-[#007ACC]" /> No deadline
                        </label>
                        <input type="datetime-local" value={endTime} disabled={noEndTime} onChange={(e) => setEndTime(e.target.value)} className={`premium-input w-full p-4 rounded-xl ${noEndTime ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2C3E50] mb-2 font-bold tracking-wider">Generated URL Endpoint</label>
                      <div className="flex items-center gap-3 bg-[#FFFFFF]/50 p-4 rounded-xl border border-[#2C3E50]/50">
                        <span className="text-[#007ACC] font-mono text-sm break-all">{contestUrl || 'Type a name to generate URL'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'questions' && (
              <motion.div key="questions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 pb-20">
                <button onClick={addQuizQuestion} className="w-full bg-[#FFFFFF] border-2 border-dashed border-[#007ACC] py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#F4F4F4] text-[#007ACC] transition-all font-black uppercase tracking-widest text-xs md:hidden mb-6">
                  <PlusCircle size={18} /> Add New Question
                </button>

                {questions.map((q, index) => (
                  <div key={index} className="glass-panel p-6 rounded-2xl relative border-l-4 border-l-[#007ACC] shadow-xl bg-[#FFFFFF]/40">
                    <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-[#2C3E50] hover:text-rose-400 transition-colors bg-[#FFFFFF]/50 p-2 rounded-lg">
                      <Trash2 size={20} />
                    </button>

                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-14">
                      <div className="flex items-center gap-4">
                        <span className="bg-[#007ACC]/20 text-[#007ACC] w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-[#007ACC]/30 font-bold">{index + 1}</span>
                        <div className="relative">
                          <select
                            value={q.questionType}
                            onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                            className="appearance-none bg-[#FFFFFF] border-2 border-[#4CAF50] text-[#007ACC] text-sm font-bold pl-3 pr-8 py-1.5 rounded-lg outline-none focus:ring-4 focus:ring-[#007ACC]/20 cursor-pointer shadow-sm hover:border-[#007ACC] transition-all"
                          >
                            <option value="MCQ">Multiple Choice</option>
                            <option value="CHECKBOX">Checkboxes</option>
                            <option value="SHORT_ANSWER">Short Answer</option>
                            <option value="LONG_ANSWER">Long Paragraph</option>
                            <option value="FILL_UP">Fill in the Blanks</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#007ACC]">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#FFFFFF] p-2 rounded-lg border border-[#4CAF50]">
                        <span className="text-sm font-medium text-[#2C3E50]">Points Value:</span>
                        <input type="number" value={q.points} onChange={(e) => updateQuestion(index, 'points', e.target.value)} className="bg-[#FFFFFF] border-none w-16 p-1 rounded-md text-center text-[#007ACC] font-bold outline-none focus:ring-1 focus:ring-[#007ACC]" />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <textarea
                        placeholder="Enter the question text here..."
                        value={q.title}
                        onChange={(e) => updateQuestion(index, 'title', e.target.value)}
                        className="premium-input w-full p-5 rounded-xl min-h-[100px] text-lg font-medium"
                      />

                      {q.questionType === 'MCQ' || q.questionType === 'CHECKBOX' ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FFFFFF]/40 p-5 rounded-xl border border-[#4CAF50]/50">
                            <div className="col-span-full flex justify-between items-center mb-2">
                              <h4 className="text-sm font-bold text-[#2C3E50] uppercase tracking-widest">Options</h4>
                              <button onClick={() => addOption(index)} className="text-xs text-[#007ACC] flex items-center gap-1 hover:text-[#F0A500]">
                                <PlusCircle size={14} /> Add Option
                              </button>
                            </div>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-3 relative group">
                                <span className="font-bold text-[#2C3E50] text-sm w-6 text-center">{['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][oIdx] || oIdx + 1}</span>
                                <input
                                  type="text"
                                  placeholder={`Option ${['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][oIdx] || oIdx + 1} value`}
                                  value={opt}
                                  onChange={(e) => {
                                    const newOptions = [...q.options];
                                    newOptions[oIdx] = e.target.value;
                                    updateQuestion(index, 'options', newOptions);
                                  }}
                                  className={`premium-input w-full p-3 rounded-lg border transition-colors pr-10 ${q.correctAnswer === opt && opt !== '' ? 'border-[#007ACC] bg-[#007ACC]/10 text-emerald-100' : 'border-[#4CAF50]'}`}
                                />
                                {q.options.length > 2 && (
                                  <button onClick={() => removeOption(index, oIdx)} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500/50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="pt-2">
                            <label className="block text-sm font-medium text-[#007ACC] mb-2">Mark Correct Answer</label>
                            <div className="relative">
                              <select
                                value={q.correctAnswer}
                                onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                                className="appearance-none premium-input w-full pl-4 pr-10 py-3 rounded-lg bg-[#FFFFFF] border-2 border-[#4CAF50] focus:border-[#007ACC] focus:ring-4 focus:ring-[#007ACC]/20 cursor-pointer font-medium transition-all shadow-sm"
                              >
                                <option value="">-- Choose correct option --</option>
                                {q.options.map((opt, oIdx) => opt && (
                                  <option key={oIdx} value={opt}>Option {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][oIdx] || oIdx + 1} ({opt})</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#007ACC]">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : q.questionType === 'SHORT_ANSWER' || q.questionType === 'LONG_ANSWER' ? (
                        <div className="pt-2 border-2 border-dashed border-[#4CAF50]/50 rounded-xl p-6 text-center bg-[#FFFFFF]/40">
                          <p className="text-[#2C3E50] font-medium mb-2">This is a descriptive {q.questionType === 'SHORT_ANSWER' ? 'short' : 'long'} answer question.</p>
                          <p className="text-xs text-[#2C3E50] italic">Students will receive a text area to write their response. Manual evaluation is supported.</p>
                          <input type="hidden" value={q.correctAnswer = 'MANUAL_EVALUATION'} />
                        </div>
                      ) : (
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-[#007ACC] mb-2">Correct Answer (Fill-up)</label>
                          <input
                            type="text"
                            placeholder="Type the exact correct answer here..."
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                            className="premium-input w-full p-4 rounded-xl border border-[#4CAF50] focus:border-[#007ACC] transition-all font-mono"
                          />
                          <p className="text-xs text-[#2C3E50] mt-2 italic">* This field is case-sensitive for evaluation.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="text-center py-20 text-[#2C3E50] border-2 border-dashed border-[#4CAF50]/50 rounded-2xl glass-panel">
                    <p>No questions added yet. Start by clicking "Add New Question" above.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* FIXED FOOTER FIX: Floating container with pointer-events-none */}
          <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex justify-end items-center gap-4 pointer-events-none">
            {publishSuccess && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-auto text-[#007ACC] flex items-center gap-2 font-bold bg-[#FFFFFF] border border-[#007ACC]/50 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl">
                <CheckCircle2 size={18} /> Quiz Saved Successfully!
              </motion.div>
            )}
            <button
              onClick={handlePublish}
              disabled={!contestName || isPublishing || questions.length === 0}
              className={`pointer-events-auto btn-primary px-10 py-5 rounded-[1.5rem] font-black tracking-widest uppercase text-xs flex items-center gap-3 transition-all shadow-xl ${(!contestName || isPublishing || questions.length === 0) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-2 hover:scale-[1.02] active:scale-95 shadow-[#007ACC]/40'}`}
            >
              {isPublishing ? <div className="w-5 h-5 border-2 border-[#4CAF50] border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              {isPublishing ? 'Publishing...' : 'Save & Publish Quiz'}
            </button>
          </div>

          <AnimatePresence>
            {toastMessage && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
                <div className={`px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 ${toastMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  <CheckCircle2 size={18} className={toastMessage.type === 'error' ? 'hidden' : 'block'} />
                  {toastMessage.title}
                  <button onClick={() => setToastMessage(null)} className="ml-4 opacity-70 hover:opacity-100 font-black">X</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}