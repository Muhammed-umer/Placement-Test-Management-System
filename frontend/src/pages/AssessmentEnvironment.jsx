import { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { ShieldAlert, Play, CheckCircle2, X, Trophy, Save } from 'lucide-react';
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
    if (!isFullscreen || !assessment) return;

    const handleViolation = (type) => {
      setWarnings((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          alert(`CRITICAL: Second violation (${type}). Test auto-submitted.`);
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
  }, [isFullscreen, assessment]);

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => alert('Fullscreen is mandatory.'));

      document.onfullscreenchange = () => {
        if (!document.fullscreenElement) {
          setIsFullscreen(false);
          if (now >= new Date(assessment.startTime)) {
            handleViolation('Exited Fullscreen');
          }
        }
      };
    }
  };

  const runCode = () => { /* Logic for execution */ };
  const submitCode = () => { /* Logic for submission */ };

  if (!assessment) return <div className="text-white pt-20 text-center font-sans">Loading Assessment...</div>;

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 text-center"
        >
          {assessment.title}
        </motion.h1>
        <p className="text-slate-400 text-lg mb-12 italic text-center">Assessment begins in:</p>

        <div className="flex gap-4 md:gap-8">
          {[
            { label: 'Hours', value: hrs },
            { label: 'Minutes', value: mins },
            { label: 'Seconds', value: secs }
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-800/50 border border-slate-700 p-6 md:p-10 rounded-3xl flex flex-col items-center min-w-[110px] md:min-w-[160px] shadow-2xl backdrop-blur-md"
            >
              <span className="text-5xl md:text-7xl font-mono text-emerald-400 mb-2 font-bold">
                {item.value.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs text-slate-500 uppercase tracking-[0.2em] font-black">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest font-sans">Live Clock Sync</span>
        </div>
      </div>
    );
  }

  // 2. SECURITY GATE
  if (!isFullscreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-8">
        <ShieldAlert className="w-20 h-20 text-rose-500 mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4 text-center">Security Mode Required</h1>
        <p className="text-slate-400 text-center max-w-lg mb-10 leading-relaxed">
          Fullscreen mode is mandatory to ensure assessment integrity. Exit violations will result in automatic submission.
        </p>
        <button onClick={enterFullscreen} className="btn-primary px-12 py-4 rounded-xl font-bold text-xl shadow-lg">
          Initialize Secure Mode
        </button>
      </div>
    );
  }

  // 3. MAIN UI
  return (
    <div ref={containerRef} className="h-screen w-full bg-[#0f172a] text-slate-300 flex overflow-hidden font-sans select-none relative">
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col bg-slate-900/50 pb-32">
          <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900">
            <span className="font-bold text-white text-sm truncate">{assessment.title}</span>
            <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="text-xs font-bold bg-violet-600/20 text-violet-400 px-3 py-1.5 rounded-lg">
              <Trophy size={14} className="inline mr-1" /> Ranking
            </button>
          </div>

          <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/80 scrollbar-hide">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`px-6 py-3 text-xs font-bold transition-all border-b-2 ${currentQuestionIdx === idx ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-500'}`}
              >
                P{idx + 1}
              </button>
            ))}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{currentQ?.title}</h2>
              <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">{currentQ?.points} Pts</span>
            </div>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-6">{currentQ?.description}</p>
            {assessment.type === 'CODING' && (
              <div className="space-y-4">
                <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Format & Constraints</h4>
                <div className="p-4 bg-slate-800/40 rounded-xl text-sm border border-slate-800 font-mono">
                  <p className="mb-2"><strong className="text-slate-400">Input:</strong> {currentQ?.inputFormat}</p>
                  <p><strong className="text-slate-400">Constraints:</strong> {currentQ?.constraints}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-7/12 flex flex-col bg-slate-900 border-l border-slate-800 pb-32">
          {assessment.type === 'CODING' ? (
            <>
              <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-[#1e2028]">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Code Editor</span>
                <button onClick={runCode} className="px-4 py-1.5 rounded text-xs font-bold bg-slate-800 text-slate-200">Run</button>
              </div>
              <div className="flex-1">
                <Editor height="100%" language={language.value} theme="vs-dark" value={code} onChange={setCode} options={{ fontSize: 14, minimap: { enabled: false } }} />
              </div>
            </>
          ) : (
            <>
              <div className="h-14 border-b border-slate-800 flex items-center px-6 bg-[#1e2028]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Quiz Response</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                {currentQ?.questionType === 'MCQ' ? (
                  <div className="w-full max-w-md space-y-4">
                    {currentQ.options?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [currentQ.id]: opt })}
                        className={`w-full p-5 rounded-xl border-2 text-left font-bold transition-all ${quizAnswers[currentQ.id] === opt ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-700'}`}
                      >
                        <span className="mr-4 text-slate-500">{String.fromCharCode(65 + i)}.</span> {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="w-full max-w-md">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-4">Input Answer:</label>
                    <input
                      type="text"
                      value={quizAnswers[currentQ.id] || ''}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, [currentQ.id]: e.target.value })}
                      className="premium-input w-full p-5 rounded-2xl text-xl font-bold text-emerald-400"
                      placeholder="Type answer..."
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* FLOATING ACTION BAR FIX */}
      <div className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none flex justify-end items-center gap-4">
        <button
          onClick={submitCode}
          className="pointer-events-auto btn-primary px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-sm flex items-center gap-3 transition-all shadow-2xl hover:-translate-y-2 hover:scale-105 active:scale-95"
        >
          <Save size={20} />
          {assessment.type === 'CODING' ? 'Submit Code' : 'Save Response'}
        </button>
      </div>
    </div>
  );
}