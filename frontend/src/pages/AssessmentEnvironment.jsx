import { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { ShieldAlert, Play, CheckCircle2, ChevronRight, Trophy, Save, Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { motion, AnimatePresence } from 'framer-motion';

const JUDGE0_LANGUAGES = [
  { id: 50, name: 'C', value: 'c' },
  { id: 54, name: 'C++', value: 'cpp' },
  { id: 62, name: 'Java', value: 'java' },
  { id: 71, name: 'Python', value: 'python' }
];

const CODE_BOILERPLATES = {
  c: "#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    \n    return 0;\n}",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    \n    return 0;\n}",
  java: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your Java code here\n        \n    }\n}",
  python: "def solve():\n    # Write your Python code here\n    pass\n\nif __name__ == '__main__':\n    solve()"
};

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
  const [code, setCode] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [now, setNow] = useState(new Date());
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [attemptLimitExceeded, setAttemptLimitExceeded] = useState(false);
  
  // Custom Modal State  
  const [modalConfig, setModalConfig] = useState(null); // { title, message, type: 'info' | 'confirm' | 'warning', onConfirm, onCancel, confirmText, cancelText }

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
          
          let filtered = JUDGE0_LANGUAGES;
          if (data.allowedLanguages?.length > 0) {
            filtered = JUDGE0_LANGUAGES.filter(l => data.allowedLanguages.includes(l.value));
          }
          setAvailableLanguages(filtered);
          if (filtered.length > 0) {
            setLanguage(filtered[0]);
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

      // Check Attempt Limit
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`http://localhost:8081/api/v1/leaderboard/check/${id}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(allowed => {
           if (!allowed) setAttemptLimitExceeded(true);
        })
        .catch(console.error);
      }
    }
    return () => stompClient.current?.disconnect();
  }, [id]);

  // Boilerplate application when language changes
  useEffect(() => {
    if (language && availableLanguages.length > 0) {
      // Apply boilerplate if code is empty or matches another existing boilerplate
      const isCodeEmptyOrBoilerplate = !code.trim() || Object.values(CODE_BOILERPLATES).some(bp => bp === code);
      if (isCodeEmptyOrBoilerplate) {
        setCode(CODE_BOILERPLATES[language.value] || '');
      }
    }
  }, [language]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/v1/leaderboard/${id}`);
      if (res.ok) setLeaderboard(await res.json());
    } catch (e) { console.error(e); }
  };

  // Security Enforcement
  useEffect(() => {
    if (!assessment || !hasStarted) return;

    const handleViolation = (type) => {
      setWarnings((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          setModalConfig({
            title: 'Critical Violation',
            message: `Second violation detected (${type}). Your assessment is securely auto-submitting now.`,
            type: 'warning',
            confirmText: 'Acknowledge',
            onConfirm: () => {
                submitCode(true); // Auto-submit flag
            }
          });
        } else {
          setModalConfig({
            title: 'Security Warning',
            message: `${type} detected. Returning to fullscreen immediately. 1 warning remaining.`,
            type: 'warning',
            confirmText: 'Return to Fullscreen',
            onConfirm: () => {
                enterFullscreen();
                setModalConfig(null);
            }
          });
        }
        return next;
      });
    };

    const preventDefault = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setModalConfig({
             title: 'Exit Request',
             message: 'Are you sure you want to stop the assessment?',
             type: 'confirm',
             confirmText: 'Yes, Submit Test',
             cancelText: 'Return to Test',
             onConfirm: () => submitCode(true),
             onCancel: () => {
                 setModalConfig(null);
             }
        });
      }
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
  }, [assessment, hasStarted, navigate]);

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setHasStarted(true);
          if (navigator.keyboard && navigator.keyboard.lock) {
            navigator.keyboard.lock(['Escape']).catch(console.error);
          }
        })
        .catch(() => {
           setModalConfig({
             title: 'Fullscreen Required',
             message: 'Your browser blocked fullscreen mode. It is mandatory to continue.',
             type: 'info',
             confirmText: 'Try Again',
             onConfirm: () => setModalConfig(null)
           });
        });

      document.onfullscreenchange = () => {
        if (!document.fullscreenElement) {
          setIsFullscreen(false);
          // Auto submission handling logic can be executed here
          setModalConfig({
             title: 'Fullscreen Exited',
             message: 'You have exited the secure fullscreen environment. Do you want to submit your test now?',
             type: 'confirm',
             confirmText: 'Yes, Submit Test',
             cancelText: 'No, Return to Test',
             onConfirm: () => submitCode(true),
             onCancel: () => {
                 enterFullscreen();
                 setModalConfig(null);
             }
          });
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

  const handleLanguageChange = (e) => {
    const selectedObj = availableLanguages.find(l => l.value === e.target.value);
    if (selectedObj) setLanguage(selectedObj);
  };

  const runCode = async () => {
    if (!code.trim()) {
      setOutput('Please write some code before running.');
      return;
    }
    
    setIsRunning(true);
    setOutput('Executing code on secure server...');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/v1/code/run', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          source_code: code,
          language_id: language.id,
          stdin: questions[currentQuestionIdx]?.inputFormat || ''
        })
      });

      const data = await response.json();
      if (data.error) {
         setOutput(data.error);
      } else {
         const decodeB64 = (str) => {
             if (!str) return null;
             try { return atob(str); } catch(e) { return str; }
         };
         const stdout = decodeB64(data.stdout);
         const stderr = decodeB64(data.stderr);
         const compileOutput = decodeB64(data.compile_output);
         
         const decodedOutput = stdout || stderr || compileOutput || 'Program ran successfully with no output.';
         setOutput(decodedOutput);
      }
    } catch (err) {
      setOutput('Server connection failed. Could not execute code.');
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async (isAutoSubmit = false) => { 
    const finalise = async () => {
        // Submit to leaderboard backend
        try {
            const token = localStorage.getItem('token');
            // Mock score calculation - in real system, this would be graded by Judge0 / Quiz answers
            let projectedScore = assessment?.type === 'QUIZ' ? Math.floor(Math.random() * assessment?.totalPoints) : 100;

            await fetch('http://localhost:8081/api/v1/leaderboard/submit', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 ...(token ? { 'Authorization': `Bearer ${token}` } : {})
               },
               body: JSON.stringify({
                 assessmentId: assessment.id,
                 points: projectedScore
               })
            });
        } catch (e) { console.error('Submission error:', e); }

        setModalConfig({
          title: 'Success',
          message: 'Assessment submitted securely. Thank you!',
          type: 'info',
          confirmText: 'Return to Dashboard',
          onConfirm: () => {
             if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log(err));
             }
             navigate('/dashboard');
          }
        });
    };

    if (isAutoSubmit) {
       finalise();
       return;
    }

    setModalConfig({
        title: 'Confirm Submission',
        message: 'Are you sure you want to finalise and submit your assessment? This action cannot be reversed.',
        type: 'confirm',
        confirmText: 'Confirm & Submit',
        cancelText: 'Cancel',
        onConfirm: () => {
           setModalConfig(null);
           finalise();
        },
        onCancel: () => {
            setModalConfig(null);
            enterFullscreen();
        }
    });
  };

  if (!assessment) return <div className="bg-[#FFFFFF] min-h-screen text-[#2C3E50] pt-20 text-center font-sans font-bold uppercase tracking-widest text-sm">Loading Environment...</div>;

  const startTime = assessment.startTime ? new Date(assessment.startTime) : null;
  const isBeforeStart = startTime && now < startTime;
  const endTime = assessment.endTime ? new Date(assessment.endTime) : null;
  const isAfterEnd = endTime && now > endTime;
  const currentQ = questions[currentQuestionIdx];

  // Auto-submit when time runs out
  useEffect(() => {
    if (hasStarted && isAfterEnd && (!modalConfig || modalConfig.title !== 'Time is Up!')) {
      setModalConfig({
        title: 'Time is Up!',
        message: 'The assessment time limit has been reached. Your work is being automatically submitted.',
        type: 'warning',
        confirmText: 'Acknowledge',
        onConfirm: () => {
          submitCode(true);
        }
      });
    }
  }, [isAfterEnd, hasStarted, modalConfig]);

  // 1. LIMIT EXCEEDED UI
  if (attemptLimitExceeded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-900 p-4 font-sans text-center">
         <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
         <h1 className="text-4xl font-extrabold mb-4">Attempt Limit Reached</h1>
         <p className="text-lg font-bold mb-8">You have reached the maximum number of attempts allowed for this assessment.</p>
         <button onClick={() => navigate('/dashboard')} className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors">Return to Dashboard</button>
      </div>
    );
  }

  // 1.5. TIME ENDED UI (If not started yet)
  if (isAfterEnd && !hasStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F4F4] text-[#2C3E50] p-4 font-sans text-center">
         <ShieldAlert className="w-20 h-20 text-slate-400 mb-6" />
         <h1 className="text-4xl font-extrabold mb-4">Assessment Ended</h1>
         <p className="text-lg font-bold mb-8 text-[#2C3E50]/70">The time limit for this assessment has passed. You can no longer participate.</p>
         <button onClick={() => navigate('/dashboard')} className="bg-[#007ACC] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#006bb3] transition-colors shadow-lg">Return to Dashboard</button>
      </div>
    );
  }

  // 2. WAITING ROOM UI WITH ACTIVE TIMER
  if (isBeforeStart) {
    const diff = Math.max(0, startTime.getTime() - now.getTime());
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F4F4] text-[#2C3E50] p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#4CAF50]/40 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-[#007ACC] drop-shadow-sm"
        >
          {assessment.title}
        </motion.h1>
        <p className="text-[#2C3E50]/60 text-lg mb-12 italic text-center font-bold tracking-wider">Assessment unlocks in:</p>

        <div className="flex gap-4 md:gap-8 relative z-10">
          {[
            { label: 'Hours', value: hrs, color: 'text-[#007ACC]' },
            { label: 'Minutes', value: mins, color: 'text-[#F0A500]' },
            { label: 'Seconds', value: secs, color: 'text-[#007ACC]' }
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#FFFFFF] border-4 border-[#4CAF50] p-6 md:p-10 rounded-[2rem] flex flex-col items-center min-w-[120px] md:min-w-[180px] shadow-xl shadow-[#007ACC]/20"
            >
              <span className={`text-6xl md:text-8xl font-sans ${item.color} mb-3 font-black`}>
                {item.value.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs text-[#2C3E50]/60 uppercase tracking-[0.25em] font-black">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-20 flex items-center gap-3 px-8 py-4 bg-[#FFFFFF] border-2 border-[#4CAF50] rounded-full shadow-lg relative z-10">
          <div className="relative">
            <div className="w-3 h-3 bg-[#007ACC] rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-[#007ACC] rounded-full relative z-10"></div>
          </div>
          <span className="text-[#2C3E50] text-xs font-black uppercase tracking-widest font-sans">Live Secure Sync</span>
        </div>
      </div>
    );
  }

  // MAIN UI COMPONENT WITH AUTO-FULLSCREEN GATE
  return (
    <div ref={containerRef} className="h-screen w-full bg-[#FFFFFF] text-[#2C3E50] flex flex-col overflow-hidden font-sans select-none relative">
      
      {/* GLOBAL CUSTOM NOTIFICATION MODAL */}
      <AnimatePresence>
        {modalConfig && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#FFFFFF]/90 backdrop-blur-md"
          >
            <div className={`bg-[#F4F4F4] max-w-lg w-full p-8 rounded-[2rem] border-4 ${modalConfig.type === 'warning' ? 'border-red-400' : 'border-[#4CAF50]'} shadow-2xl text-center flex flex-col items-center`}>
              <div className={`w-16 h-16 bg-[#FFFFFF] rounded-full flex items-center justify-center mb-6 border-4 ${modalConfig.type === 'warning' ? 'border-red-400 text-red-500' : 'border-[#007ACC] text-[#007ACC]'}`}>
                 {modalConfig.type === 'warning' ? <ShieldAlert className="w-8 h-8"/> : <CheckCircle2 className="w-8 h-8"/>}
              </div>
              <h2 className="text-2xl font-extrabold text-[#2C3E50] mb-3">{modalConfig.title}</h2>
              <p className="text-[#2C3E50]/80 font-bold mb-8 leading-relaxed">{modalConfig.message}</p>
              
              <div className="flex gap-4 w-full">
                 {modalConfig.type === 'confirm' && (
                    <button 
                      onClick={modalConfig.onCancel}
                      className="flex-1 bg-[#FFFFFF] border-2 border-[#4CAF50] text-[#2C3E50] py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#F4F4F4] transition-all"
                    >
                      {modalConfig.cancelText || 'Cancel'}
                    </button>
                 )}
                 <button 
                    onClick={modalConfig.onConfirm}
                    className={`flex-1 ${modalConfig.type === 'warning' ? 'bg-red-400 hover:bg-red-500 text-white' : 'bg-[#007ACC] hover:bg-[#F0A500] text-[#2C3E50] border-2 border-[#007ACC]'} py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all`}
                  >
                    {modalConfig.confirmText || 'OK'}
                  </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. AUTO-FULLSCREEN GATE POPUP */}
      <AnimatePresence>
        {!hasStarted && !modalConfig && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#FFFFFF]/90 backdrop-blur-md"
          >
            <div className="bg-[#F4F4F4] max-w-lg w-full p-10 rounded-[2rem] border-4 border-[#4CAF50] shadow-2xl text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-[#FFFFFF] rounded-full flex items-center justify-center mb-6 border-4 border-[#007ACC]">
                <Lock className="w-10 h-10 text-[#007ACC]" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#2C3E50] mb-4">Secure Gateway</h2>
              <p className="text-[#2C3E50]/80 font-bold mb-10 leading-relaxed">
                By clicking <strong>Start</strong>, you agree to enter a secure fullscreen environment. Switching tabs or exiting fullscreen will result in penalties.
              </p>
              <button 
                onClick={handleStart} 
                className="bg-[#007ACC] text-[#2C3E50] w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-[#007ACC]/30 flex items-center justify-center gap-3 hover:bg-[#F0A500] hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play fill="currentColor" size={20}/>
                Start Assessment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col ${assessment.type === 'CODING' ? 'md:flex-row' : ''} min-w-0 pb-48 transition-all duration-700 ${!hasStarted ? 'blur-md pointer-events-none' : ''}`}>
        
        {assessment.type === 'CODING' ? (
          <>
            <div className="w-full md:w-5/12 border-r-4 border-[#4CAF50] flex flex-col bg-[#F4F4F4]">
              <div className="h-16 border-b-4 border-[#4CAF50] flex items-center justify-between px-6 bg-[#FFFFFF]">
                <span className="font-black text-[#007ACC] text-[10px] md:text-xs uppercase tracking-widest truncate">{assessment.title}</span>
                <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="text-xs font-black bg-[#F4F4F4] hover:bg-[#4CAF50] transition-colors text-[#2C3E50] px-4 py-2 border-2 border-[#4CAF50] rounded-xl flex items-center gap-1">
                  <Trophy size={14} /> Ranking
                </button>
              </div>

              <div className="flex overflow-x-auto border-b-4 border-[#4CAF50] bg-[#FFFFFF] scrollbar-hide py-3 px-4 shadow-sm z-10">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`px-6 py-2 mx-1 text-xs font-black transition-all rounded-lg border-2 ${currentQuestionIdx === idx ? 'bg-[#007ACC] border-[#007ACC] text-[#2C3E50] shadow-lg shadow-[#007ACC]/30' : 'bg-[#F4F4F4] border-[#4CAF50] text-[#2C3E50]/70 hover:text-[#2C3E50] hover:bg-[#4CAF50]'}`}
                  >
                    P{idx + 1}
                  </button>
                ))}
              </div>

              <div className="p-8 flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#2C3E50] leading-tight">{currentQ?.title}</h2>
                  <span className="text-xs font-black text-[#2C3E50] bg-[#4CAF50] px-3 py-1.5 rounded-lg border-2 border-[#007ACC] whitespace-nowrap">{currentQ?.points} Pts</span>
                </div>
                <div className="text-[#2C3E50]/80 whitespace-pre-wrap leading-relaxed mb-8 text-sm font-bold bg-[#FFFFFF] p-6 rounded-2xl border-2 border-[#4CAF50] border-l-8 border-l-[#007ACC] shadow-sm">
                  {currentQ?.description}
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-[#2C3E50] font-black text-[10px] uppercase tracking-widest ml-2">Format & Constraints</h4>
                  <div className="p-6 bg-[#FFFFFF] rounded-2xl text-sm border-2 border-[#4CAF50] font-sans text-[#2C3E50] shadow-sm font-bold">
                    <p className="mb-4"><strong className="text-[#007ACC] block text-[10px] uppercase tracking-widest font-black mb-1">Input Format</strong> {currentQ?.inputFormat}</p>
                    <p><strong className="text-[#007ACC] block text-[10px] uppercase tracking-widest font-black mb-1">Constraints</strong> {currentQ?.constraints}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-7/12 flex flex-col bg-[#FFFFFF]">
              <div className="h-16 border-b-4 border-[#4CAF50] flex items-center justify-between px-6 bg-[#F4F4F4]">
                {/* User Requested: Language Dropdown */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-[#2C3E50] uppercase tracking-widest hidden sm:inline-block">Language:</span>
                  <select 
                    value={language.value} 
                    onChange={handleLanguageChange} 
                    className="bg-[#FFFFFF] border-2 border-[#4CAF50] text-[#2C3E50] font-black text-xs px-4 py-2 rounded-xl focus:outline-none focus:border-[#007ACC]"
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang.id} value={lang.value}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <button onClick={runCode} disabled={isRunning} className="px-6 py-2 rounded-xl text-xs font-black bg-[#007ACC] hover:bg-[#F0A500] text-[#2C3E50] shadow-lg shadow-[#007ACC]/30 transition-all border-2 border-[#007ACC] flex items-center gap-2 disabled:opacity-50">
                  <Play size={14} fill="currentColor" /> {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
              <div className="h-[60%] bg-[#FFFFFF] py-4">
                <Editor 
                  height="100%" 
                  language={language.value} 
                  theme="light" 
                  value={code} 
                  onChange={setCode} 
                  options={{ 
                    fontSize: 16, 
                    minimap: { enabled: false }, 
                    fontFamily: 'monospace',
                    lineHeight: 1.6,
                    padding: { top: 16 }
                  }} 
                />
              </div>
              <div className="h-[40%] border-t-4 border-[#4CAF50] bg-[#F4F4F4] flex flex-col">
                <div className="h-10 border-b-2 border-[#4CAF50] flex items-center px-6 bg-[#FFFFFF]">
                  <span className="text-[10px] font-black text-[#2C3E50] uppercase tracking-widest">Execution Output Logs</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                   <pre className="font-mono text-sm text-[#2C3E50] whitespace-pre-wrap">{output || 'Awaiting execution...'}</pre>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* QUIZ UI REVAMP */
          <div className="flex-1 flex flex-col self-center max-w-4xl w-full p-4 mt-8">
             <div className="flex items-center justify-between mb-8 px-4">
               <div>
                  <h1 className="text-xl font-black text-[#2C3E50]">{assessment.title}</h1>
                  <p className="text-sm text-[#2C3E50]/60 font-bold">Question {currentQuestionIdx + 1} of {questions.length}</p>
               </div>
               <div className="text-sm font-black bg-[#F4F4F4] text-[#2C3E50] px-5 py-2 border-2 border-[#4CAF50] rounded-xl flex items-center gap-2">
                 <Trophy size={16} className="text-[#007ACC]" /> {currentQ?.points} Points
               </div>
             </div>

             {/* Centered Question Card */}
             <div className="bg-[#FFFFFF] p-10 md:p-14 rounded-[2rem] border-4 border-[#4CAF50] shadow-2xl flex-1 flex flex-col justify-center relative">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#2C3E50] leading-relaxed mb-12 text-center">
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
                          className={`w-full p-6 rounded-2xl border-[3px] text-left font-bold text-lg md:text-xl transition-all duration-300 flex items-center shadow-md ${
                            isSelected 
                              ? 'border-[#007ACC] bg-[#F4F4F4] text-[#2C3E50] shadow-lg shadow-[#007ACC]/10 scale-[1.02]' 
                              : 'border-[#F4F4F4] text-[#2C3E50]/70 hover:border-[#4CAF50] hover:bg-[#F4F4F4]/50'
                          }`}
                        >
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center mr-5 text-sm font-black transition-colors ${isSelected ? 'bg-[#007ACC] text-[#2C3E50] border-[3px] border-[#007ACC]' : 'bg-[#F4F4F4] border-[#4CAF50] border-2 text-[#2C3E50]/50'}`}>
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
                          className={`w-full p-6 rounded-2xl border-[3px] text-left font-bold text-lg md:text-xl transition-all duration-300 flex items-center shadow-md ${
                            isSelected 
                              ? 'border-[#007ACC] bg-[#F4F4F4] text-[#2C3E50] shadow-lg shadow-[#007ACC]/10 scale-[1.02]' 
                              : 'border-[#F4F4F4] text-[#2C3E50]/70 hover:border-[#4CAF50] hover:bg-[#F4F4F4]/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-5 border-[3px] transition-colors ${isSelected ? 'bg-[#007ACC] border-[#007ACC] text-[#2C3E50]' : 'border-[#4CAF50] bg-[#F4F4F4]'}`}>
                             {isSelected && <CheckCircle2 size={18} strokeWidth={3} />}
                          </div>
                          {opt}
                        </button>
                      );
                    })
                  ) : currentQ?.questionType === 'LONG_ANSWER' ? (
                    <div className="w-full">
                      <label className="text-[10px] font-black tracking-widest text-[#007ACC] uppercase block mb-4 ml-2">Type your detailed response</label>
                      <textarea
                        value={quizAnswers[currentQ.id] || ''}
                        onChange={(e) => setQuizAnswers({ ...quizAnswers, [currentQ.id]: e.target.value })}
                        className="w-full p-6 rounded-[2xl] text-lg font-medium text-[#2C3E50] bg-[#FFFFFF] border-[3px] border-[#4CAF50] focus:border-[#007ACC] focus:ring-4 focus:ring-[#4CAF50]/30 placeholder:text-[#2C3E50]/30 transition-all shadow-sm min-h-[200px] outline-none"
                        placeholder="Start typing your answer here..."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <label className="text-[10px] font-black tracking-widest text-[#007ACC] uppercase block mb-4 ml-2">{currentQ?.questionType === 'SHORT_ANSWER' ? 'Type your short response' : 'Type your exact answer'}</label>
                      <input
                        type="text"
                        value={quizAnswers[currentQ.id] || ''}
                        onChange={(e) => setQuizAnswers({ ...quizAnswers, [currentQ.id]: e.target.value })}
                        className="w-full p-8 rounded-[2xl] text-2xl font-black text-center text-[#2C3E50] bg-[#FFFFFF] border-[3px] border-[#4CAF50] focus:border-[#007ACC] focus:ring-4 focus:ring-[#4CAF50]/30 placeholder:text-[#2C3E50]/30 transition-all shadow-sm outline-none"
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
      <div className="fixed bottom-0 left-0 right-0 p-6 md:p-10 z-[60] pointer-events-none flex justify-end items-center gap-4">
        {assessment.type === 'QUIZ' && currentQuestionIdx < questions.length - 1 && (
           <button
             onClick={nextQuestion}
             className="pointer-events-auto bg-[#FFFFFF] hover:bg-[#F4F4F4] text-[#2C3E50] px-8 py-5 rounded-[1.5rem] font-black tracking-widest uppercase text-xs flex items-center gap-3 transition-all shadow-2xl hover:-translate-y-2 hover:scale-[1.02] border-[3px] border-[#4CAF50]"
           >
             Next Question <ChevronRight size={18} strokeWidth={3} />
           </button>
        )}
        
        <button
          onClick={submitCode}
          className="pointer-events-auto bg-[#007ACC] hover:bg-[#F0A500] text-[#2C3E50] px-10 py-5 rounded-[1.5rem] font-black tracking-widest uppercase text-xs flex items-center gap-3 transition-all shadow-2xl hover:-translate-y-2 hover:scale-[1.02] active:scale-95 shadow-[#007ACC]/40 outline-none border-[3px] border-[#007ACC]"
        >
          <Save size={18} strokeWidth={3} />
          {assessment.type === 'CODING' ? 'Submit Routine' : 'Save Progress'}
        </button>
      </div>

    </div>
  );
}