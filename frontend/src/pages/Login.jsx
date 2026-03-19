import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black"></div>
      <div className="absolute top-0 -z-10 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
      
      {/* Floating decorative blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-purple-600 blur-[120px] opacity-40 mix-blend-screen animate-pulse duration-1000"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-indigo-500 blur-[120px] opacity-30 mix-blend-screen animate-pulse duration-700 delay-300"></div>

      <div className="w-full max-w-md space-y-8 glass-panel-dark p-10 rounded-3xl relative overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10">
        
        {/* Shine effect */}
        <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-5 animate-[shimmer_3s_infinite]"></div>

        <div className="relative z-10">
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-sm text-indigo-200/70 mb-8">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form className="relative z-10 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm text-center py-3 px-4 rounded-xl backdrop-blur-sm animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 ml-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 ml-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] focus:outline-none active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <Link to="/signup" className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 flex items-center justify-center group">
              Don't have an account? <span className="ml-1 group-hover:underline">Sign up</span>
              <svg className="ml-1 h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
