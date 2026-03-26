import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { Send, Play, CheckCircle, Mic, MicOff, StopCircle, ArrowLeft, Terminal as TerminalIcon, Bot, User, AlertCircle, RefreshCw } from 'lucide-react';

const LANGUAGE_MAP = {
  python: { id: 71, name: 'Python' },
  java: { id: 62, name: 'Java' },
  cpp: { id: 54, name: 'C++' }
};

const DEFAULT_CODE = {
  python: 'def solution():\n    # Write your code here\n    pass\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}'
};

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'code' | 'output'

  // ... (keep therapeutic useEffects and handlers)

  // Interview UI
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {!sessionInfo && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center pointer-events-none">
           <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 shadow-2xl animate-pulse">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
           </div>
           <div className="text-2xl text-white font-bold tracking-tight">Preparing Interview Room...</div>
           <p className="text-slate-500 mt-2 text-sm">Setting up your AI interviewer and code environment</p>
        </div>
      )}
      
      {/* Top Banner indicating evaluating state */}
      {isEvaluating && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2.5 font-bold tracking-widest text-xs uppercase z-50 shadow-2xl animate-pulse">
          Analyzing transcript and computing your final score...
        </div>
      )}

      {/* Mobile Tab Navigation */}
      <div className="flex md:hidden bg-slate-900 border-b border-white/5 p-1">
        {['chat', 'code', 'output'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-indigo-500/10 text-indigo-400 shadow-inner' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative transition-opacity duration-500" style={{ opacity: isEvaluating ? 0.2 : 1, pointerEvents: isEvaluating ? 'none' : 'auto' }}>
        
        {/* Left panel: Chat and Problem */}
        <div className={`w-full md:w-1/3 h-full border-r border-white/5 flex flex-col bg-slate-900 relative ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-5 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
            <h2 className="font-bold text-white capitalize flex items-center text-lg tracking-tight">
              <Bot className="w-5 h-5 text-indigo-400 mr-2" /> {topic} Interview
            </h2>
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                 <div className={`max-w-[90%] rounded-2xl p-4 shadow-xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none border border-indigo-500' 
                      : 'bg-slate-800/50 border border-white/5 text-slate-200 rounded-tl-none backdrop-blur-sm'
                 }`}>
                   <div className={`flex items-center mb-2 text-[10px] font-bold uppercase tracking-widest ${msg.role === 'user' ? 'justify-end text-indigo-200' : 'text-slate-500'}`}>
                     {msg.role === 'user' ? (
                       <><span className="mr-2">You</span><User size={12} /></>
                     ) : (
                       <><Bot size={12} className="mr-2 text-indigo-400" /><span>AI Interviewer</span></>
                     )}
                   </div>
                   {msg.role === 'user' ? (
                     <p className="text-sm prose prose-invert max-w-none">{msg.content}</p>
                   ) : (
                     renderBotMessage(msg.content)
                   )}
                 </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 bg-slate-900 border-t border-white/5">
            <div className="flex space-x-2 bg-slate-800/50 border border-white/5 rounded-2xl p-1 focus-within:border-indigo-500/50 transition-colors">
              <button 
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-95' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
              </button>
              <input 
                type="text" 
                className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm px-3 outline-none"
                placeholder="Talk to the interviewer..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button 
                onClick={handleSendChat}
                className="p-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group"
              >
                <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right panel: Editor and Terminal */}
        <div className={`flex-1 h-full flex flex-col bg-slate-950 ${activeTab !== 'chat' ? 'flex' : 'hidden md:flex'}`}>
          {/* Editor Area */}
          <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'code' ? 'flex' : 'hidden md:flex'}`}>
            <div className="bg-slate-900/50 border-b border-white/5 py-3 px-5 flex justify-between items-center">
               <div className="flex items-center space-x-6">
                 <div className="flex items-center space-x-2">
                    <Code size={16} className="text-indigo-400" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Main.{language === 'python' ? 'py' : language}</span>
                 </div>
                 <select 
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 outline-none hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                 </select>
               </div>
               <div className="flex space-x-3">
                 <button 
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-transparent text-emerald-400 hover:text-white text-xs font-bold rounded-xl flex items-center transition-all disabled:opacity-50"
                 >
                   {isExecuting ? <RefreshCw size={14} className="mr-2 animate-spin" /> : <Play size={14} className="mr-2" />}
                   {isExecuting ? 'RUNNING' : 'RUN CODE'}
                 </button>
                 <button 
                    onClick={handleEndInterview}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white text-xs font-bold rounded-xl flex items-center transition-all"
                 >
                   <StopCircle size={14} className="mr-2" /> 
                   <span>END SESSION</span>
                 </button>
               </div>
            </div>
            
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 16,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  wordWrap: 'on',
                  lineHeight: 26,
                  padding: { top: 20 },
                  backgroundColor: '#020617',
                  scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                  },
                }}
              />
            </div>
          </div>
          
          {/* Terminal Area */}
          <div className={`h-full md:h-72 border-t border-white/5 bg-slate-950 flex flex-col ${activeTab === 'output' ? 'flex' : 'hidden md:flex'}`}>
             <div className="bg-slate-900/80 px-5 py-3 flex justify-between items-center border-b border-white/5">
                <span className="text-[11px] uppercase tracking-widest font-bold text-slate-500 flex items-center">
                  <TerminalIcon className="w-3.5 h-3.5 mr-2" /> Program Output
                </span>
                {executionResult?.status && (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    ['Accepted', 'MOCK'].some(s => executionResult.status.description?.includes(s)) 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {executionResult.status.description}
                  </span>
                )}
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 font-mono text-sm scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {!executionResult ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50 space-y-4">
                    <TerminalIcon size={40} />
                    <p className="text-xs uppercase tracking-widest font-bold font-sans">Awaiting execution results...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {executionResult.stdout && (
                      <div className="animate-fade-in text-emerald-400 whitespace-pre-wrap leading-relaxed">
                        <span className="text-slate-600 block mb-2 font-sans font-bold text-[10px] uppercase tracking-widest tracking-widest">Stdout:</span>
                        {executionResult.stdout}
                      </div>
                    )}
                    {executionResult.stderr && (
                      <div className="animate-fade-in text-rose-400 whitespace-pre-wrap leading-relaxed">
                        <span className="text-slate-600 block mb-2 font-sans font-bold text-[10px] uppercase tracking-widest">Stderr / Compiler:</span>
                        {executionResult.stderr}
                      </div>
                    )}
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewSession;

export default InterviewSession;
