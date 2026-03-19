import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Database, CPU, Layout, Clock, Play } from 'lucide-react';

const TOPICS = [
  { id: 'DSA', name: 'Data Structures & Algorithms', icon: BookOpen, color: 'from-blue-500 to-cyan-400' },
  { id: 'DBMS', name: 'Database Management', icon: Database, color: 'from-fuchsia-500 to-pink-500' },
  { id: 'OS', name: 'Operating Systems', icon: CPU, color: 'from-emerald-400 to-teal-500' },
  { id: 'System Design', name: 'System Design', icon: Layout, color: 'from-orange-400 to-rose-400' },
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
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 relative overflow-hidden">
      
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 -z-10 bg-slate-900"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent"></div>

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="relative pt-8 pb-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight">
            Welcome back, {user.name?.split(' ')[0] || 'Developer'}!
          </h1>
          <p className="text-lg text-slate-400">
            Ready to ace your next technical interview? Select a topic below to begin.
          </p>
        </header>

        {/* Topics Grid */}
        <section>
          <div className="flex items-center mb-6">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3 border border-indigo-500/30">
                <Play className="text-indigo-400 w-4 h-4 ml-0.5" />
             </div>
             <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Start New Session</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOPICS.map((topic) => (
              <div 
                key={topic.id} 
                onClick={() => startInterview(topic.id)}
                className="group relative glass-panel-dark rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-700/50 hover:border-slate-500/50"
              >
                {/* Glow behind card */}
                <div className={`absolute -inset-px opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${topic.color} rounded-2xl`}></div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br ${topic.color}`}>
                    <topic.icon className="text-white w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{topic.id}</h3>
                    <p className="text-slate-400 text-sm font-medium">{topic.name}</p>
                  </div>
                </div>
                
                {/* Animated enter arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="pb-12">
          <div className="flex items-center mb-6">
             <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/30">
                <Clock className="text-purple-400 w-4 h-4" />
             </div>
             <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Recent Interviews</h2>
          </div>

          <div className="glass-panel-dark rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                 <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin mb-4"></div>
                 <p className="text-slate-400 font-medium tracking-wide">Loading your history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <BookOpen className="text-slate-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Past Interviews</h3>
                <p className="text-slate-400 max-w-md mx-auto">Start your first interview session by selecting a topic above to begin tracking your performance.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {history.map((session) => (
                  <li key={session._id} className="group hover:bg-slate-800/40 transition-colors duration-200">
                    <div className="px-6 py-5 sm:px-8">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center flex-1">
                          <div className={`w-3 h-3 rounded-full mr-4 shadow-[0_0_10px_currentColor] ${session.status === 'completed' ? 'text-emerald-400 bg-emerald-400' : 'text-amber-400 bg-amber-400'}`}></div>
                          <div>
                            <p className="text-lg font-bold text-white uppercase tracking-wider">{session.topic}</p>
                            <div className="flex items-center mt-1 text-sm text-slate-400">
                               <span className="font-medium mr-3 pr-3 border-r border-slate-700">Difficulty: {session.difficulty}</span>
                               <span>{new Date(session.startTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-4 py-1.5 inline-flex text-xs font-bold uppercase tracking-widest rounded-full border backdrop-blur-sm ${
                            session.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Optional Evaluation Score Preview */}
                      {session.evaluation && session.evaluation.score && session.evaluation.score !== "N/A" && (
                         <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-sm md:w-fit md:ml-7 bg-slate-900/50 px-4 py-2 rounded-lg border border-white/5">
                           <span className="text-slate-400 mr-4">Final Score:</span>
                           <span className="font-bold text-indigo-400">{session.evaluation.score}</span>
                         </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
