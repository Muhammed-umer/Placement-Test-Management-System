import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Save, PlusCircle, Trash2, ListChecks, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [contestName, setContestName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [noEndTime, setNoEndTime] = useState(false);
  const [contestUrl, setContestUrl] = useState('');

  const [questions, setQuestions] = useState([]);

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
     if(updated[questionIndex].correctAnswer && !updated[questionIndex].options.includes(updated[questionIndex].correctAnswer)) {
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
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: (endTime && !noEndTime) ? new Date(endTime).toISOString() : null,
      url: contestUrl,
      questions: questions.map(q => ({
        ...q,
        points: Number(q.points)
      })),
      allowedLanguages: []
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
    <div className="min-h-screen pt-12 p-4 md:p-8 max-w-5xl mx-auto z-10 relative text-[#2C3E50] font-sans pb-48">
      {/* STICKY TOPBAR */}
      <div className="sticky top-0 z-50 bg-[#F4F4F4] pt-8 pb-4 border-b-2 border-[#4CAF50]/30 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 -mx-4 shadow-sm md:px-8 md:-mx-8">
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
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={addQuizQuestion} 
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
            <div className="glass-panel p-8 rounded-2xl border border-[#4CAF50]/50 shadow-2xl relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="text-[#007ACC]" /> General Setup
              </h2>
              <div className="space-y-5 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-2 font-bold tracking-wider">Quiz Name</label>
                  <input type="text" value={contestName} onChange={(e) => setContestName(e.target.value)} placeholder="e.g., Midterm Evaluation" className="premium-input w-full p-4 rounded-xl text-lg font-semibold" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    <select
                      value={q.questionType}
                      onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                      className="bg-[#FFFFFF] border border-[#4CAF50] text-[#007ACC] text-sm font-bold px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-[#007ACC]"
                    >
                      <option value="MCQ">Multiple Choice</option>
                      <option value="CHECKBOX">Checkboxes</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                      <option value="LONG_ANSWER">Long Paragraph</option>
                      <option value="FILL_UP">Fill in the Blanks</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 bg-[#FFFFFF] p-2 rounded-lg border border-[#4CAF50]">
                    <span className="text-sm font-medium text-[#2C3E50]">Points Value:</span>
                    <input type="number" value={q.points} onChange={(e) => updateQuestion(index, 'points', e.target.value)} className="bg-[#FFFFFF] border-none w-16 p-1 rounded-md text-center text-white font-bold outline-none focus:ring-1 focus:ring-[#007ACC]" />
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
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                          className="premium-input w-full p-3 rounded-lg bg-[#FFFFFF] border border-[#4CAF50] focus:border-[#007ACC] cursor-pointer font-medium"
                        >
                          <option value="">-- Choose correct option --</option>
                          {q.options.map((opt, oIdx) => opt && (
                            <option key={oIdx} value={opt}>Option {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][oIdx] || oIdx + 1} ({opt})</option>
                          ))}
                        </select>
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
  );
}