import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Database, Cpu, Layout, Clock, Play, GraduationCap, Trophy, Target, ArrowRight } from 'lucide-react';

const TOPICS = [
  { id: 'DSA', name: 'Data Structures & Algorithms', icon: GraduationCap, color: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-400', border: 'border-blue-500/30' },
  { id: 'DBMS', name: 'Database Management', icon: Database, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400', border: 'border-emerald-500/30' },
  { id: 'OS', name: 'Operating Systems', icon: Cpu, color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400', border: 'border-amber-500/30' },
  { id: 'System Design', name: 'System Design', icon: Layout, color: 'from-purple-500/20 to-fuchsia-500/20', iconColor: 'text-purple-400', border: 'border-purple-500/30' },
];

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/interview/history');
      setHistory(res.data.history);
    } catch (error) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const startInterview = (topicId) => {
    navigate(`/interview/${topicId.toLowerCase()}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-950">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <header className="mb-12 animate-fade-in text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Target className="w-3 h-3" />
            <span>Preparation Dashboard</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Welcome back, <span className="text-gradient-primary">{user.name?.split(' ')[0] || 'Developer'}</span>!
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Choose a topic to start a simulated interview and receive detailed AI feedback on your performance.
          </p>
        </header>

        {/* Topics Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3 border border-indigo-500/30">
                  <Play className="text-indigo-400 w-4 h-4 ml-0.5" />
               </div>
               New Session
             </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOPICS.map((topic) => (
              <div 
                key={topic.id} 
                onClick={() => startInterview(topic.id)}
                className={`group relative glass-panel-dark rounded-3xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-indigo-500/10 border border-white/5 hover:border-white/20`}
              >
                {/* Topic specific background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner bg-slate-900 border ${topic.border}`}>
                    <topic.icon className={`${topic.iconColor} w-7 h-7`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{topic.id}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{topic.name}</p>
                    
                    <div className="flex items-center text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      Start Practice <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/30">
                   <Clock className="text-purple-400 w-4 h-4" />
                </div>
                Recent Activity
             </h2>
          </div>

          <div className="glass-panel-dark rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center">
                 <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin mb-4"></div>
                 <p className="text-slate-500 text-sm font-medium">Fetching history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                  <BookOpen className="text-slate-700 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No past sessions found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Complete your first interview to see your detailed progress report and scores here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Topic</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Score</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((session) => (
                      <tr key={session._id} className="group hover:bg-white/[0.03] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                            <span className="font-bold text-white tracking-wide uppercase">{session.topic}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            session.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-400">
                          {new Date(session.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-6">
                          {session.evaluation && session.evaluation.score && session.evaluation.score !== "N/A" ? (
                            <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                              {session.evaluation.score}
                            </span>
                          ) : (
                            <span className="text-slate-600 font-bold">--</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                            title="View Details"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
