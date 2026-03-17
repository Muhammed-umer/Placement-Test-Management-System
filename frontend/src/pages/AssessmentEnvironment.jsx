import { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { ShieldAlert, Play, CheckCircle2, ChevronRight, Menu, X, Trophy } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

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
  const [output, setOutput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Contest States
  const [now, setNow] = useState(new Date());
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const containerRef = useRef(null);
  const stompClient = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8081/api/v1/assessments/${id}`)
        .then(res => res.json())
        .then(data => {
          setAssessment(data);
          const formattedQuestions = (data.questions || []).map(q => ({
            ...q,
            status: 'unvisited'
          }));
          setQuestions(formattedQuestions);
          
          if (data.allowedLanguages && data.allowedLanguages.length > 0) {
            const filtered = JUDGE0_LANGUAGES.filter(l => data.allowedLanguages.includes(l.value));
            if (filtered.length > 0) {
               setAvailableLanguages(filtered);
               setLanguage(filtered[0]);
            }
          }
        })
        .catch(console.error);

      fetchLeaderboard();

      // Setup STOMP for Leaderboard Updates
      const socket = new SockJS('http://localhost:8081/ws');
      const client = Stomp.over(socket);
      client.debug = () => {}; // disable debug
      client.connect({}, () => {
        client.subscribe(`/topic/leaderboard/${id}`, () => {
          fetchLeaderboard();
        });
      });
      stompClient.current = client;
    }

    return () => {
      if (stompClient.current) stompClient.current.disconnect();
    };
  }, [id]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/v1/leaderboard/${id}`);
      if (res.ok) {
        setLeaderboard(await res.json());
      }
    } catch (e) { console.error(e); }
  };

  // Anti-Cheat & Fullscreen Logic
  useEffect(() => {
    if (!isFullscreen || !assessment) return; // Only apply if in-test
    
    // Determine condition
    const startTime = new Date(assessment.startTime);
    const endTime = assessment.endTime ? new Date(assessment.endTime) : null;
    if (now < startTime || (endTime && now > endTime)) return;

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x'))
      ) {
        e.preventDefault();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab Switch');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFullscreen, assessment, now]);

  const handleViolation = (type) => {
    setWarnings((prev) => {
      const newWarnings = prev + 1;
      if (newWarnings >= 2) {
        alert('Multiple violations detected. Test auto-submitted.');
        navigate('/dashboard');
      } else {
        alert(`Warning: ${type} detected. 1 warning remaining before auto-submit.`);
      }
      return newWarnings;
    });
  };

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => alert('Failed to enter fullscreen mode. Please manually press F11.'));
      
      document.onfullscreenchange = () => {
        if (!document.fullscreenElement) {
          setIsFullscreen(false);
          handleViolation('Exited Fullscreen');
        }
      };
    }
  };

  const executeTestCase = async (tc) => {
    const res = await fetch('http://localhost:8081/api/v1/code/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: code,
        language_id: language.id,
        stdin: tc.input || ''
      })
    });
    return res.json();
  };

  const runCode = async () => {
    setIsRunning(true);
    let log = '';
    const q = questions[currentQuestionIdx];
    const sampleTests = q.testCases?.filter(tc => tc.isSample) || [];

    if (sampleTests.length === 0) {
      log = 'No sample test cases to run. Try Submit.\n';
      setOutput(log);
      setIsRunning(false);
      return;
    }

    try {
      for (let i = 0; i < sampleTests.length; i++) {
        log += `--- Running Sample ${i + 1} ---\n`;
        setOutput(log);
        const data = await executeTestCase(sampleTests[i]);
        log += `Input:\n${sampleTests[i].input}\n`;
        if (data.compile_output) {
          log += `Compilation Error:\n${data.compile_output}\n`;
          break;
        } else if (data.stderr) {
          log += `Runtime Error:\n${data.stderr}\n`;
          break;
        } else {
          const out = data.stdout || '';
          log += `Output:\n${out}\n`;
          log += `Expected:\n${sampleTests[i].expectedOutput}\n`;
          if (out.trim() === sampleTests[i].expectedOutput.trim()) {
            log += `Result: PASSED ✨\n\n`;
          } else {
            log += `Result: FAILED ❌\n\n`;
          }
        }
        setOutput(log);
      }
    } catch (e) {
      log += 'Connection Error.';
      setOutput(log);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    setIsRunning(true);
    let log = 'Submitting code against all test cases...\n';
    setOutput(log);
    const q = questions[currentQuestionIdx];
    const allTests = q.testCases || [];

    if (allTests.length === 0) {
      log += 'No test cases configured.\n';
      setOutput(log);
      setIsRunning(false);
      return;
    }

    try {
      let passed = true;
      for (let i = 0; i < allTests.length; i++) {
        const data = await executeTestCase(allTests[i]);
        if (data.compile_output || data.stderr) {
          passed = false;
          log += `Test Case ${i+1} Failed: Error occurred.\n`;
          break;
        }
        const out = data.stdout || '';
        if (out.trim() !== allTests[i].expectedOutput.trim()) {
          passed = false;
          log += `Test Case ${i+1} Failed: Output mismatch.\n`;
          break;
        }
      }

      const updated = [...questions];
      
      if (passed) {
        log += '\nALL TEST CASES PASSED! 🎉\n';
        if (updated[currentQuestionIdx].status !== 'solved') {
          updated[currentQuestionIdx].status = 'solved';
          setQuestions(updated);
          
          // Send to leaderboard
          await fetch('http://localhost:8081/api/v1/leaderboard/submit', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              assessmentId: assessment.id,
              studentEmail: 'student@gcee.ac.in', // Mock auth
              studentName: 'Student user',
              points: q.points
            })
          });
        }
      } else {
        log += '\nSOME TEST CASES FAILED. Keep trying!\n';
        updated[currentQuestionIdx].status = 'attempted';
        setQuestions(updated);
      }
      setOutput(log);
    } catch (e) {
       setOutput('Connection Error during submission.');
    } finally {
      setIsRunning(false);
    }
  };

  if (!assessment) return <div className="text-white pt-20 text-center">Loading Assessment...</div>;

  const startTime = new Date(assessment.startTime);
  const endTime = assessment.endTime ? new Date(assessment.endTime) : null;
  const isBeforeStart = now < startTime;
  const isAfterEnd = endTime && now > endTime;

  if (isBeforeStart) {
    const diff = startTime - now;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return (
       <div className="min-h-screen pt-12 flex flex-col items-center justify-center bg-[#0f172a] text-white">
         <h1 className="text-3xl font-bold mb-4">{assessment.title}</h1>
         <p className="text-slate-400 mb-8">Contest Starts In:</p>
         <div className="flex gap-4 mb-10">
           {[['Hours', hrs], ['Minutes', mins], ['Seconds', secs]].map(([l, v]) => (
             <div key={l} className="bg-slate-800 p-6 rounded-2xl flex flex-col items-center min-w-[120px]">
               <span className="text-4xl font-mono text-emerald-400 mb-2">{v.toString().padStart(2, '0')}</span>
               <span className="text-xs text-slate-500 uppercase tracking-widest">{l}</span>
             </div>
           ))}
         </div>
       </div>
    );
  }

  if (!isFullscreen && !isAfterEnd) {
    return (
      <div className="min-h-screen pt-12 p-8 flex flex-col items-center justify-center z-10 relative">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-6" />
        <h1 className="text-3xl font-bold font-sans text-slate-50 text-center mb-4">Secure Environment Required</h1>
        <p className="text-slate-400 max-w-lg text-center mb-8">
          This test requires Fullscreen mode. Exiting fullscreen, minimizing the window, opening devtools, or switching tabs will result in a warning, and eventually an auto-submit.
        </p>
        <button onClick={enterFullscreen} className="btn-primary px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-emerald-500/25">
          Enter Fullscreen & Start Test
        </button>
      </div>
    );
  }

  const renderLeaderboard = () => (
    <div className="fixed inset-0 z-[200] bg-[#0f172a]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Trophy className="text-yellow-500"/> Live Leaderboard</h2>
          <button onClick={() => setShowLeaderboard(false)} className="text-slate-400 hover:text-white"><X /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-800">
                <th className="pb-3 pl-4">Rank</th>
                <th className="pb-3">Student</th>
                <th className="pb-3 text-right">Points</th>
                <th className="pb-3 text-right pr-4">Finish Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pl-4 font-mono text-emerald-400">#{i + 1}</td>
                  <td className="py-4 font-medium text-slate-300">
                    {entry.studentName} <span className="text-xs text-slate-500 block">{entry.studentEmail}</span>
                  </td>
                  <td className="py-4 text-right font-bold text-violet-400">{entry.totalPoints} pts</td>
                  <td className="py-4 text-right pr-4 text-sm text-slate-400">
                    {new Date(entry.finishTime).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan="4" className="py-10 text-center text-slate-500">No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#0f172a] text-slate-300 flex overflow-hidden z-[100] relative font-sans">
      
      {showLeaderboard && renderLeaderboard()}

      {/* Main Execution Area */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        
        {/* Question View */}
        <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col bg-slate-900/50">
           <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900">
             <div className="flex items-center gap-3">
               <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white"><X size={20}/></button>
               <span className="font-bold text-white text-sm">{assessment.title}</span>
             </div>
             <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="text-xs font-semibold bg-violet-600/20 text-violet-400 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-violet-600/30">
               <Trophy size={14}/> Leaderboard
             </button>
           </div>
           
           {/* Question Nav */}
           <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/80 scrollbar-hide">
              {questions.map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${currentQuestionIdx === idx ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'} ${q.status === 'solved' ? 'text-violet-400' : ''}`}
                >
                  P{idx + 1} {q.status === 'solved' && ' ✓'}
                </button>
              ))}
           </div>

          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-white">{questions[currentQuestionIdx]?.title}</h1>
              <span className="text-sm font-bold text-emerald-500">{questions[currentQuestionIdx]?.points} Pts</span>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 font-mono bg-slate-800/50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">{questions[currentQuestionIdx]?.description}</p>
            
            <div className="space-y-4">
              {questions[currentQuestionIdx]?.inputFormat && (
                <div>
                  <strong className="text-emerald-400 block mb-1 text-sm">Input Format:</strong>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{questions[currentQuestionIdx].inputFormat}</p>
                </div>
              )}
              {questions[currentQuestionIdx]?.outputFormat && (
                <div>
                  <strong className="text-emerald-400 block mb-1 text-sm">Output Format:</strong>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{questions[currentQuestionIdx].outputFormat}</p>
                </div>
              )}
              {questions[currentQuestionIdx]?.constraints && (
                <div>
                  <strong className="text-emerald-400 block mb-1 text-sm">Constraints:</strong>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-2 rounded">{questions[currentQuestionIdx].constraints}</p>
                </div>
              )}
              
              {questions[currentQuestionIdx]?.testCases?.filter(tc => tc.isSample).map((tc, tcIdx) => (
                <div key={tcIdx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-2 mt-4">
                  <p className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">Example {tcIdx + 1}</p>
                  <p className="text-sm font-mono"><span className="text-emerald-400">Input:</span><br/>{tc.input}</p>
                  <p className="text-sm font-mono mt-2"><span className="text-emerald-400">Output:</span><br/>{tc.expectedOutput}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor View */}
        <div className="w-full md:w-7/12 flex flex-col bg-slate-900">
          <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-[#1e2028]">
            <select 
              value={language.value} 
              onChange={(e) => setLanguage(availableLanguages.find(l => l.value === e.target.value))}
              className="bg-slate-800 text-sm shadow text-emerald-400 font-bold border-none outline-none px-3 py-1.5 rounded cursor-pointer"
            >
              {availableLanguages.map(l => <option key={l.id} value={l.value}>{l.name}</option>)}
            </select>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 font-medium mr-2">{isAfterEnd && 'Contest Ended'}</span>
              <button 
                onClick={runCode} 
                className={`px-4 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${isRunning || isAfterEnd ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                disabled={isRunning || isAfterEnd}
              >
                <Play className="w-4 h-4 text-emerald-400" /> Run Code
              </button>
              <button 
                onClick={submitCode} 
                className={`px-4 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${isRunning || isAfterEnd ? 'bg-emerald-900/50 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'}`}
                disabled={isRunning || isAfterEnd}
              >
                <CheckCircle2 className="w-4 h-4" /> Submit
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language.value}
              theme="vs-dark"
              value={code}
              onChange={setCode}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 24,
                padding: { top: 16 }
              }}
            />
          </div>
          
          <div className="h-64 bg-[#1e2028] border-t border-slate-800 flex flex-col">
            <div className="px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>Console Output</span>
              {isRunning && <span className="text-emerald-400 flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-t-emerald-400 animate-spin"/> Executing...</span>}
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <pre className="text-sm font-mono text-slate-300">
                {output || '> Waiting for execution...'}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
