import { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { ShieldAlert, Play, CheckCircle2, ChevronRight, Menu, X } from 'lucide-react';

const QUESTIONS = [
  { id: 1, title: 'Two Sum', status: 'attempted' },
  { id: 2, title: 'Valid Palindrome', status: 'unvisited' },
  { id: 3, title: 'Reverse Linked List', status: 'skipped' },
  { id: 4, title: 'Binary Search', status: 'unvisited' }
];

const LANGUAGES = [
  { id: 54, name: 'C++ (GCC 9.2.0)', value: 'cpp' },
  { id: 62, name: 'Java (OpenJDK 13)', value: 'java' },
  { id: 71, name: 'Python (3.8.1)', value: 'python' },
  { id: 50, name: 'C (GCC 9.2.0)', value: 'c' }
];

export default function AssessmentEnvironment() {
  const [warnings, setWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState('// Write your solution here');
  const [output, setOutput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const containerRef = useRef(null);

  // Anti-Cheat & Fullscreen Logic
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+C, Ctrl+V
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
  }, []);

  const handleViolation = (type) => {
    setWarnings((prev) => {
      const newWarnings = prev + 1;
      if (newWarnings >= 2) {
        alert('Multiple violations detected. Test auto-submitted.');
        // router.push('/dashboard') in real app
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

  const runCode = () => {
    setOutput('Running test cases...\nCompiling...\n\nOutput:\n[1, 2]');
  };

  if (!isFullscreen) {
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

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#0f172a] text-slate-300 flex overflow-hidden z-[100] relative font-sans">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-slate-800 rounded text-white"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Interactive Palette Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-800 mt-12 md:mt-0">
          <h2 className="text-lg font-bold text-slate-100 flexitems-center gap-2">
            Assessment Hub
          </h2>
          <div className="text-sm font-mono text-emerald-400 mt-1">Timer: 45:00</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {QUESTIONS.map((q, idx) => (
            <div 
              key={q.id}
              className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-slate-800/50 transition-colors
                ${q.status === 'attempted' ? 'border-l-emerald-500 bg-slate-800/20' : 
                  q.status === 'skipped' ? 'border-l-rose-500 bg-slate-800/10' : 
                  'border-l-slate-600'}
              `}
            >
              <p className="text-sm font-medium text-slate-200">Q{idx + 1}. {q.title}</p>
              <div className="flex pt-1 mt-1 justify-between items-center text-xs text-slate-500">
                <span className="uppercase tracking-wider">
                  {q.status}
                </span>
                <span>10 Pts</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button className="w-full btn-danger shadow-none hover:shadow-none py-2 rounded-lg text-sm font-medium">
            Finish & Submit Exam
          </button>
        </div>
      </div>

      {/* Main Execution Area */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        
        {/* Question View */}
        <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-4 md:p-6 flex-1 overflow-y-auto pt-16 md:pt-6">
            <h1 className="text-2xl font-bold text-white mb-2">1. Two Sum</h1>
            <p className="text-sm text-slate-400 mb-6">Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6">
              <p className="text-sm font-mono"><span className="text-emerald-400">Input:</span> nums = [2,7,11,15], target = 9</p>
              <p className="text-sm font-mono mt-2"><span className="text-emerald-400">Output:</span> [0,1]</p>
            </div>
          </div>
        </div>

        {/* Editor View */}
        <div className="w-full md:w-7/12 flex flex-col bg-slate-900">
          <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-[#1e2028]">
            <select 
              value={language.value} 
              onChange={(e) => setLanguage(LANGUAGES.find(l => l.value === e.target.value))}
              className="bg-slate-800 text-sm text-slate-200 border-none outline-none p-1.5 rounded cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l.id} value={l.value}>{l.name}</option>)}
            </select>
            
            <div className="flex items-center gap-2">
              <button onClick={runCode} className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm flex items-center gap-2 transition-colors">
                <Play className="w-4 h-4 text-emerald-400" />
                Run Code
              </button>
              <button onClick={runCode} className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm flex items-center gap-2 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                Submit
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
          
          <div className="h-48 bg-[#1e2028] border-t border-slate-800 p-4 flex flex-col">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Console Output</div>
            <pre className="flex-1 bg-slate-900 rounded p-3 text-sm font-mono text-slate-300 overflow-y-auto border border-slate-800">
              {output || 'Run your code to see output here...'}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
