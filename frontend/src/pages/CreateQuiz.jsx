import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Clock, Save, PlusCircle, Trash2, ListChecks, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details'); 
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const [contestName, setContestName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [noEndTime, setNoEndTime] = useState(false);
  const [contestUrl, setContestUrl] = useState('');
  
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (contestName) {
      const formatted = contestName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setContestUrl(`https://assesshub.gcee.ac.in/q/${formatted}`);
    } else {
      setContestUrl('');
    }
  }, [contestName]);

  const addQuizQuestion = () => {
    setQuestions([...questions, {
      type: 'QUIZ',
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

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
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
      title: contestName,
      description: `Quiz ID: ${contestUrl}`,
      type: 'QUIZ',
      totalPoints,
      durationMinutes,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: (endTime && !noEndTime) ? new Date(endTime).toISOString() : null,
      url: contestUrl,
      questions: questions,
      allowedLanguages: [] // empty for quiz
    };

    try {
      const res = await fetch('http://localhost:8081/api/v1/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
    <div className="min-h-screen pt-12 p-4 md:p-8 max-w-5xl mx-auto z-10 relative text-slate-200 font-sans pb-32">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button onClick={() => navigate('/admin')} className="text-emerald-400 flex items-center gap-1 mb-4 hover:underline text-sm font-medium">
            <ArrowLeft size={16} /> Back to Overview
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight flex items-center gap-3">
            <ListChecks size={36} className="text-emerald-400" /> Quiz Builder
          </h1>
        </div>
        
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 overflow-x-auto">
          {['details', 'questions'].map(tab => (
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
            <div className="glass-panel p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="text-emerald-400" /> General Setup
              </h2>
              <div className="space-y-5 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Quiz Name</label>
                  <input type="text" value={contestName} onChange={(e) => setContestName(e.target.value)} placeholder="e.g., Midterm Evaluation" className="premium-input w-full p-4 rounded-xl text-lg font-semibold border border-slate-700 focus:border-emerald-500 transition-colors" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Start Time (IST)</label>
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="premium-input w-full p-4 rounded-xl border border-slate-700 focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      End Time (IST) 
                      <input type="checkbox" checked={noEndTime} onChange={e => setNoEndTime(e.target.checked)} className="ml-2 accent-emerald-500" /> No deadline
                    </label>
                    <input type="datetime-local" value={endTime} disabled={noEndTime} onChange={(e) => setEndTime(e.target.value)} className={`premium-input w-full p-4 rounded-xl border border-slate-700 focus:border-emerald-500 transition-colors ${noEndTime ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Generated URL Endpoint</label>
                  <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-emerald-900/50">
                     <span className="text-emerald-400 font-mono text-sm break-all">{contestUrl || 'Type a name to generate URL'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div key="questions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <button onClick={addQuizQuestion} className="glass-panel px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-500/20 text-emerald-400 transition-all font-semibold border border-emerald-500/30">
              <PlusCircle size={20} /> Add New Question
            </button>

            {questions.map((q, index) => (
              <div key={index} className="glass-panel p-6 rounded-2xl relative border-l-4 border-l-emerald-500 shadow-xl bg-slate-800/40">
                <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors bg-slate-800/50 p-2 rounded-lg">
                  <Trash2 size={20} />
                </button>

                <div className="mb-4 flex items-center justify-between pr-14">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-emerald-500/30">{index + 1}</span>
                    Question Context
                  </h3>
                  <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <span className="text-sm font-medium text-slate-400">Points Value:</span>
                    <input type="number" value={q.points} onChange={(e) => updateQuestion(index, 'points', e.target.value)} className="bg-slate-800 border-none w-16 p-1 rounded-md text-center text-white font-bold outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                </div>

                <div className="space-y-5">
                  <textarea
                    placeholder="Enter the question text here..."
                    value={q.title}
                    onChange={(e) => updateQuestion(index, 'title', e.target.value)}
                    className="premium-input w-full p-5 rounded-xl min-h-[100px] text-lg font-medium border border-slate-700 focus:border-emerald-500 transition-all resize-y"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
                    <div className="col-span-full mb-2">
                       <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Multiple Choice Options</h4>
                    </div>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <span className="font-bold text-slate-500 text-sm w-6 text-center">{['A', 'B', 'C', 'D'][oIdx]}</span>
                        <input
                          type="text"
                          placeholder={`Option ${['A', 'B', 'C', 'D'][oIdx]} value`}
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[oIdx] = e.target.value;
                            updateQuestion(index, 'options', newOptions);
                          }}
                          className={`premium-input w-full p-3 rounded-lg border transition-colors ${q.correctAnswer === opt && opt !== '' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100' : 'border-slate-700 focus:border-slate-500'}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-emerald-400 mb-2">Mark Correct Answer</label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      className="premium-input w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 cursor-pointer font-medium"
                    >
                      <option value="">-- Choose correct option --</option>
                      {q.options.map((opt, oIdx) => opt && (
                        <option key={oIdx} value={opt}>Option {['A', 'B', 'C', 'D'][oIdx]} ({opt})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700/50 rounded-2xl glass-panel">
                <p>No questions added yet. Start by clicking "Add New Question" above.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-50 flex justify-end items-center gap-4">
        {publishSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400 flex items-center gap-2 font-semibold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
            <CheckCircle2 size={18} /> Quiz Saved Successfully!
          </motion.div>
        )}
        <button
          onClick={handlePublish}
          disabled={!contestName || isPublishing || questions.length === 0}
          className={`btn-primary px-8 py-3.5 rounded-xl font-bold tracking-wide flex items-center gap-2 transition-all ${(!contestName || isPublishing || questions.length === 0) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-1 shadow-lg shadow-emerald-500/25'}`}
        >
          {isPublishing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
          {isPublishing ? 'Publishing...' : 'Save & Publish Quiz'}
        </button>
      </div>
    </div>
  );
}
