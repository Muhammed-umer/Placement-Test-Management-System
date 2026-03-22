import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateQuiz from './pages/CreateQuiz';
import AssessmentEnvironment from './pages/AssessmentEnvironment';
import ResetPassword from './pages/ResetPassword';
import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { SECURITY_CONFIG } from './config/security';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  if (!mustChangePassword && location.pathname === '/reset-password') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    if (SECURITY_CONFIG.disableInspection) {
      const preventDefault = (e) => e.preventDefault();
      
      // Disable Context Menu (Right Click)
      document.addEventListener('contextmenu', preventDefault);
      
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      const disableKeys = (e) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U') ||
          (e.metaKey && e.altKey && e.key === 'I') || // Mac OS
          (e.metaKey && e.altKey && e.key === 'J') || // Mac OS
          (e.metaKey && e.key === 'U') // Mac OS
        ) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('keydown', disableKeys);
      
      return () => {
        document.removeEventListener('contextmenu', preventDefault);
        document.removeEventListener('keydown', disableKeys);
      };
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen text-[#2C3E50] bg-[#F4F4F4] relative overflow-hidden font-sans">
        {/* Abstract background blobs for premium feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4CAF50]/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4CAF50]/40 rounded-full blur-[120px] pointer-events-none"></div>
        
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/create-quiz" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><AssessmentEnvironment /></ProtectedRoute>} />
            <Route path="/assessment/:id" element={<ProtectedRoute><AssessmentEnvironment /></ProtectedRoute>} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
