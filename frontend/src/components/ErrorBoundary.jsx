import React from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F4F4] text-[#2C3E50] p-6 font-sans">
          <ShieldAlert className="w-24 h-24 text-red-500 mb-6 drop-shadow-md" />
          <h1 className="text-4xl font-extrabold mb-4 text-center">Something Went Wrong</h1>
          <p className="text-lg font-bold mb-8 text-center max-w-lg text-[#2C3E50]/70">
            A critical error occurred while rendering this page. Our team has been notified.
          </p>
          <button 
            onClick={() => window.location.replace('/')} 
            className="bg-[#007ACC] text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#F0A500] hover:-translate-y-1 transition-all shadow-lg shadow-[#007ACC]/30"
          >
            <RefreshCcw size={20} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
