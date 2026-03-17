import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateQuiz from './pages/CreateQuiz';
import AssessmentEnvironment from './pages/AssessmentEnvironment';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-slate-50 relative overflow-hidden">
        {/* Abstract background blobs for premium feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/create-quiz" element={<CreateQuiz />} />
          <Route path="/assessment" element={<AssessmentEnvironment />} />
          <Route path="/assessment/:id" element={<AssessmentEnvironment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
