import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  // Don't show solid background in interview session keeping it fully immersive
  const isInterview = location.pathname.includes('/interview/');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isInterview ? 'bg-slate-900 border-b border-gray-800' : 'bg-slate-900/60 backdrop-blur-lg border-b border-white/10 shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Area */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-lg leading-none">AI</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-purple-200">
                InterviewPro
              </span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {token ? (
              <>
                <Link to="/dashboard" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/5 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-md shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-500/40 active:scale-95">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
