import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateQuiz from './pages/CreateQuiz';
import AssessmentEnvironment from './pages/AssessmentEnvironment';
import ResetPassword from './pages/ResetPassword';

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
  return (
    <Router>
      <div className="min-h-screen text-[#2C3E50] bg-[#F4F4F4] relative overflow-hidden font-sans">
        {/* Abstract background blobs for premium feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4CAF50]/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4CAF50]/40 rounded-full blur-[120px] pointer-events-none"></div>
        
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
      </div>
    </Router>
  );
}

export default App;
