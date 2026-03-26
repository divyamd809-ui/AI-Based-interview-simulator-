import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User, ShieldCheck } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  const isInterview = location.pathname.includes('/interview/');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = token ? [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ] : [
    { name: 'Login', path: '/login' },
    { name: 'Sign Up', path: '/signup', primary: true },
  ];

  return (
    <nav className={`sticky top-0 z-[100] transition-all duration-300 ${isInterview ? 'bg-slate-900 border-b border-white/5' : 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 shadow-xl'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Area */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Interview<span className="text-indigo-400">Pro</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                className={link.primary ? "btn-primary !py-2 !px-5 text-sm" : "text-slate-300 hover:text-white font-medium text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/5"}
              >
                {link.name}
              </Link>
            ))}
            {token && (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full bg-slate-900 border-b border-white/10 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block w-full px-4 py-3 rounded-xl text-base font-medium transition-colors ${link.primary ? 'bg-indigo-600 text-white text-center' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
          {token && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-base font-medium text-rose-400 hover:bg-rose-400/10 transition-colors border border-rose-400/20 mt-4"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
