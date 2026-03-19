import { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { ShieldAlert, Play, CheckCircle2, ChevronRight, Trophy, Save, Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { motion, AnimatePresence } from 'framer-motion';

const JUDGE0_LANGUAGES = [
  { id: 54, name: 'C++ (GCC 9.2.0)', value: 'cpp' },
  { id: 62, name: 'Java (OpenJDK 13)', value: 'java' },
  { id: 71, name: 'Python (3.8.1)', value: 'python' },
  { id: 50, name: 'C (GCC 9.2.0)', value: 'c' }
];

export default function AssessmentEnvironment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState(JUDGE0_LANGUAGES);
  const [language, setLanguage] = useState(JUDGE0_LANGUAGES[0]);
  const [code, setCode] = useState('// Write your solution here');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [now, setNow] = useState(new Date());
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const containerRef = useRef(null);
  const stompClient = useRef(null);

  // Sync internal clock every second for the timer
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data and Setup WebSockets
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8081/api/v1/assessments/${id}`)
        .then(res => res.json())
        .then(data => {
          setAssessment(data);
          setQuestions((data.questions || []).map(q => ({ ...q, status: 'unvisited' })));
          if (data.allowedLanguages?.length > 0) {
            const filtered = JUDGE0_LANGUAGES.filter(l => data.allowedLanguages.includes(l.value));
            if (filtered.length > 0) {
              setAvailableLanguages(filtered);
              setLanguage(filtered[0]);
            }
          }
        })
        .catch(console.error);

      fetchLeaderboard();

      const socketFactory = () => new SockJS('http://localhost:8081/ws');
      const client = Stomp.over(socketFactory);
      client.debug = () => { };
      client.connect({}, () => {
        client.subscribe(`/topic/leaderboard/${id}`, () => fetchLeaderboard());
      });
      stompClient.current = client;
    }
    return () => stompClient.current?.disconnect();
  }, [id]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/v1/leaderboard/${id}`);
      if (res.ok) setLeaderboard(await res.json());
    } catch (e) { console.error(e); }
  };

  // Security Enforcement
  useEffect(() => {
    if (!isFullscreen || !assessment || !hasStarted) return;

    const handleViolation = (type) => {
      setWarnings((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          alert(`CRITICAL: Second violation (${type}). Test auto-submitted.`);
          submitCode();
          navigate('/dashboard');
        } else {
          alert(`WARNING: ${type} detected. Returning to fullscreen. 1 warning remaining.`);
          enterFullscreen();
        }
        return next;
      });
    };

    const preventDefault = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x'))) {
        e.preventDefault();
      }
    };
    const handleVisibility = () => { if (document.hidden) handleViolation('Tab Switching'); };

    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('paste', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('paste', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isFullscreen, assessment, hasStarted, navigate]);

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setHasStarted(true);
        })
        .catch(() => alert('Fullscreen is mandatory.'));

      document.onfullscreenchange = () => {
        if (!document.fullscreenElement) {
          setIsFullscreen(false);
          if (now >= new Date(assessment?.startTime || Date.now())) {
            // handle violation triggered by use-effect when isFullscreen flips
          }
        }
      };
    }
  };

  const handleStart = () => {
    enterFullscreen();
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const runCode = () => { /* Logic for execution */ };
  const submitCode = () => { /* Logic for submission */ };

  if (!assessment) return <div className="text-white pt-20 text-center font-sans font-bold uppercase tracking-widest text-sm">Loading Environment...</div>;

  const startTime = new Date(assessment.startTime);
  const isBeforeStart = now < startTime;
  const currentQ = questions[currentQuestionIdx];

  // 1. WAITING ROOM UI WITH ACTIVE TIMER
  if (isBeforeStart) {
    const diff = Math.max(0, startTime.getTime() - now.getTime());
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1a] text-white p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-lg"
        >
          {assessment.title}
        </motion.h1>
        <p className="text-slate-400 text-lg mb-12 italic text-center font-semibold tracking-wider">Assessment unlocks in:</p>

        <div className="flex gap-4 md:gap-8 relative z-10">
          {[
            { label: 'Hours', value: hrs, color: 'text-violet-400' },
            { label: 'Minutes', value: mins, color: 'text-emerald-400' },
            { label: 'Seconds', value: secs, color: 'text-rose-400' }
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-900/80 border border-slate-700/50 p-6 md:p-10 rounded-[2rem] flex flex-col items-center min-w-[120px] md:min-w-[180px] shadow-2xl shadow-slate-900 backdrop-blur-xl"
            >
              <span className={`text-6xl md:text-8xl font-mono ${item.color} mb-3 font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
                {item.value.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs text-slate-500 uppercase tracking-[0.25em] font-black">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-20 flex items-center gap-3 px-8 py-4 bg-slate-900/50 border border-slate-800 rounded-full shadow-lg relative z-10">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full relative z-10"></div>
          </div>
          <span className="text-slate-300 text-xs font-bold uppercase tracking-widest font-sans">Live Secure Sync</span>
        </div>
      </div>
    );
  }

  // MAIN UI COMPONENT WITH AUTO-FULLSCREEN GATE
  return (
    <div ref={containerRef} className="h-screen w-full bg-[#0a0f1a] text-slate-200 flex flex-col overflow-hidden font-sans select-none relative">
      
      {/* 2. AUTO-FULLSCREEN GATE POPUP */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/80"
          >
            <div className="glass-panel max-w-lg w-full p-10 rounded-[2rem] border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/20">
                <Lock className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-4">Secure Gateway</h2>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                By clicking <strong>Start</strong>, you agree to enter a secure fullscreen environment. Switching tabs or exiting fullscreen will result in penalties.
              </p>
              <button 
                onClick={handleStart} 
                className="btn-primary w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play fill="currentColor" size={20}/>
                Start Assessment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col ${assessment.type === 'CODING' ? 'md:flex-row' : ''} min-w-0 pb-48 transition-all duration-700 ${!hasStarted ? 'blur-md pointer-events-none scale-95 opacity-50' : ''}`}>
        
        {assessment.type === 'CODING' ? (
          <>
            <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col bg-slate-900/50">
              <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900">
                <span className="font-bold text-emerald-400 text-xs uppercase tracking-widest truncate">{assessment.title}</span>
                <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="text-xs font-bold bg-violet-600/20 hover:bg-violet-600/30 transition-colors text-violet-400 px-4 py-2 rounded-xl">
                  <Trophy size={14} className="inline mr-1" /> Ranking
                </button>
              </div>

              <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/80 scrollbar-hide py-2 px-2">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`px-6 py-2 mx-1 text-xs font-bold transition-all rounded-lg ${currentQuestionIdx === idx ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/20' : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'}`}
                  >
                    P{idx + 1}
                  </button>
                ))}
              </div>

              <div className="p-8 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-extrabold text-white leading-tight">{currentQ?.title}</h2>
                  <span className="text-sm font-black text-violet-300 bg-violet-500/20 px-3 py-1.5 rounded-lg border border-violet-500/30">{currentQ?.points} Pts</span>
                </div>
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-8 text-sm font-medium bg-slate-800/20 p-6 rounded-2xl border border-slate-700/30 border-l-4 border-l-emerald-500">
                  {currentQ?.description}
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em]">Format & Constraints</h4>
                  <div className="p-5 bg-slate-900/80 rounded-2xl text-sm border border-slate-800 font-mono text-slate-300 shadow-inner">
                    <p className="mb-4"><strong className="text-slate-500 block text-[10px] uppercase tracking-widest font-sans mb-1">Input Format</strong> {currentQ?.inputFormat}</p>
                    <p><strong className="text-slate-500 block text-[10px] uppercase tracking-widest font-sans mb-1">Constraints</strong> {currentQ?.constraints}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-7/12 flex flex-col bg-slate-900">
              <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-[#1e2028]">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Code Editor</span>
                <button onClick={runCode} className="px-6 py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors">Run Tests</button>
              </div>
              <div className="flex-1">
                <Editor height="100%" language={language.value} theme="vs-dark" value={code} onChange={setCode} options={{ fontSize: 14, minimap: { enabled: false }, fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
            </div>
          </>
        ) : (
          /* QUIZ UI REVAMP */
          <div className="flex-1 flex flex-col self-center max-w-4xl w-full p-4 mt-8">
             <div className="flex items-center justify-between mb-8 px-4">
               <div>
                  <h1 className="text-xl font-bold text-slate-400">{assessment.title}</h1>
                  <p className="text-sm text-slate-500 font-medium">Question {currentQuestionIdx + 1} of {questions.length}</p>
               </div>
               <div className="text-sm font-bold bg-emerald-500/10 text-emerald-400 px-4 py-2 border border-emerald-500/30 rounded-xl">
                 {currentQ?.points} Points
               </div>
             </div>

             {/* Centered Question Card */}
             <div className="glass-panel p-10 md:p-14 rounded-[2rem] border-slate-700/50 shadow-2xl flex-1 flex flex-col justify-center relative bg-slate-800/30">
                <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-12 text-center drop-shadow-md">
                  {currentQ?.title}
                </h2>

                <div className="w-full max-w-2xl mx-auto space-y-4">
                  {currentQ?.questionType === 'MCQ' ? (
                    currentQ.options?.map((opt, i) => {
                      const isSelected = quizAnswers[currentQ.id] === opt;
                      return (
                        <button
                          key={i}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [currentQ.id]: opt })}
                          className={`w-full p-6 rounded-2xl border-2 text-left font-bold text-lg md:text-xl transition-all duration-300 flex items-center shadow-lg ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100 shadow-emerald-500/20 translate-x-2' 
                              : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800/40'
                          }`}
                        >
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center mr-5 text-sm ${isSelected ? 'bg-emerald-500 text-slate-900 border-none' : 'bg-slate-800 border-slate-700 border text-slate-500'}`}>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][i] || i + 1}
                          </span> 
                          {opt}
                        </button>
                      );
                    })
                  ) : currentQ?.questionType === 'CHECKBOX' ? (
                    currentQ.options?.map((opt, i) => {
                      const isSelected = (quizAnswers[currentQ.id] || []).includes(opt);
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            const currentAnswers = quizAnswers[currentQ.id] || [];
                            const newAnswers = isSelected ? currentAnswers.filter(o => o !== opt) : [...currentAnswers, opt];
                            setQuizAnswers({ ...quizAnswers, [currentQ.id]: newAnswers });
                          }}
                          className={`w-full p-6 rounded-2xl border-2 text-left font-bold text-lg md:text-xl transition-all duration-300 flex items-center shadow-lg ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100 shadow-emerald-500/20 translate-x-2' 
                              : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-5 border-2 transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'border-slate-600 bg-slate-800'}`}>
                             {isSelected && <CheckCircle2 size={16} />}
                          </div>
                          {opt}
                        </button>
                      );
                    })
                  ) : currentQ?.questionType === 'LONG_ANSWER' ? (
                    <div className="w-full">
                      <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-4 ml-2">Type your detailed response</label>
                      <textarea
                        value={quizAnswers[currentQ.id] || ''}
                        onChange={(e) => setQuizAnswers({ ...quizAnswers, [currentQ.id]: e.target.value })}
                        className="premium-input w-full p-6 rounded-[2xl] text-lg font-medium text-emerald-100 bg-slate-900/80 border border-slate-700 focus:border-emerald-500 placeholder:text-slate-700 transition-colors shadow-inner min-h-[200px]"
                        placeholder="Start typing your answer here..."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-4 ml-2">{currentQ?.questionType === 'SHORT_ANSWER' ? 'Type your short response' : 'Type your exact answer'}</label>
                      <input
                        type="text"
                        value={quizAnswers[currentQ.id] || ''}
                        onChange={(e) => setQuizAnswers({ ...quizAnswers, [currentQ.id]: e.target.value })}
                        className="premium-input w-full p-8 rounded-[2xl] text-2xl font-black text-center text-emerald-300 bg-slate-900/80 border border-slate-700 focus:border-emerald-500 placeholder:text-slate-700 transition-colors shadow-inner"
                        placeholder="Insert Answer..."
                      />
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR FIX: pointer-events-none and container positioning fixed to bot */}
      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-10 z-[60] pointer-events-none flex justify-end items-center gap-4 bg-gradient-to-t from-[#0a0f1a] to-transparent">
        {assessment.type === 'QUIZ' && currentQuestionIdx < questions.length - 1 && (
           <button
             onClick={nextQuestion}
             className="pointer-events-auto btn-primary bg-slate-800 hover:bg-slate-700 text-emerald-400 px-8 py-5 rounded-[1.5rem] font-black tracking-widest uppercase text-xs flex items-center gap-3 transition-all shadow-xl hover:-translate-y-2 hover:scale-[1.02] border border-slate-700"
           >
             Next Question <ChevronRight size={18} />
           </button>
        )}
        
        <button
          onClick={submitCode}
          className="pointer-events-auto btn-primary px-10 py-5 rounded-[1.5rem] font-black tracking-widest uppercase text-xs flex items-center gap-3 transition-all shadow-xl hover:-translate-y-2 hover:scale-[1.02] active:scale-95 shadow-emerald-500/20 outline-none"
        >
          <Save size={18} />
          {assessment.type === 'CODING' ? 'Submit Routine' : 'Save Progress'}
        </button>
      </div>

    </div>
  );
}