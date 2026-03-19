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

function InterviewSession() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [sessionInfo, setSessionInfo] = useState(null);
  
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE['python']);
  
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', 
      content: { 
        feedback: `Hello! I'm your AI interviewer for ${topic.toUpperCase()}. Let's get started. Generating your question...`,
        hint: "",
        question: ""
      } 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    startSession();
    
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(prev => prev + (prev.length > 0 ? ' ' : '') + transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [topic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const startSession = async () => {
    try {
      const res = await api.post('/interview/start', { topic: topic.toUpperCase(), difficulty: 'Medium' });
      setSessionInfo(res.data);
      if (res.data.question) {
         setChatHistory(prev => [
           { role: 'bot', content: { 
             feedback: "Session Started.", 
             hint: "", 
             question: `**${res.data.question.title}**\n${res.data.question.description}` 
           }}
         ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech Recognition is not supported in your browser.");
      }
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !sessionInfo) return;
    
    const userMsg = chatInput;
    setChatHistory([...chatHistory, { role: 'user', content: userMsg }]);
    setChatInput('');
    
    try {
      const res = await api.post(`/interview/chat/${sessionInfo.sessionId}`, { message: userMsg });
      setChatHistory(prev => [...prev, { role: 'bot', content: res.data.response }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const payload = { 
        source_code: code, 
        language_id: LANGUAGE_MAP[language].id 
      };
      if (sessionInfo) payload.session_id = sessionInfo.sessionId;
      
      const res = await api.post('/code/execute', payload);
      setExecutionResult(res.data);
    } catch (err) {
      console.error(err);
      setExecutionResult({ status: { description: "Request Failed" }, stderr: "Could not contact server." });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleEndInterview = async () => {
    if (!sessionInfo || !window.confirm("Are you sure you want to end the interview and receive your evaluation?")) return;
    
    setIsEvaluating(true);
    try {
      const res = await api.post(`/interview/evaluate/${sessionInfo.sessionId}`, { code });
      setEvaluation(res.data.evaluation);
    } catch (err) {
      console.error("Evaluation failed", err);
      alert("Failed to fetch evaluation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const renderBotMessage = (content) => {
    if (typeof content === 'string') return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    
    return (
      <div className="text-sm space-y-3">
        {content.feedback && <p className="text-slate-200 leading-relaxed font-medium">{content.feedback}</p>}
        {content.hint && (
          <div className="bg-amber-500/10 text-amber-200 p-3 rounded-xl border border-amber-500/20 shadow-inner flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-amber-400" />
            <span className="leading-relaxed text-xs"><strong>Hint:</strong> {content.hint}</span>
          </div>
        )}
        {content.question && (
          <div className="bg-indigo-500/10 text-indigo-100 p-4 rounded-xl border border-indigo-500/20 mt-3 shadow-inner">
            <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-300 block mb-2">Interviewer Question</span>
            <span className="whitespace-pre-wrap leading-relaxed block text-sm">{content.question}</span>
          </div>
        )}
      </div>
    );
  };

  // Evaluation Map Display
  if (evaluation) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-slate-900 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-indigo-400 hover:text-indigo-300 mb-8 transition-colors group bg-slate-800/50 px-4 py-2 rounded-full w-fit hover:bg-slate-800 border border-slate-700/50"
          >
            <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
          </button>
          
          <div className="glass-panel-dark overflow-hidden sm:rounded-3xl border border-slate-700/50 relative shadow-2xl">
            {/* Header Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none"></div>

            <div className="relative px-6 py-10 sm:px-12 border-b border-slate-800 text-center">
               <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">Evaluation Summary</h2>
               <p className="text-slate-400">Detailed breakdown of your session performance</p>
            </div>

            <div className="px-6 py-8 sm:px-12 bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800">
               <div className="text-center md:text-left">
                 <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Score</span>
                 <span className="block text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{evaluation.score}</span>
               </div>
               <div className="text-center md:text-right">
                 <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Topic</span>
                 <span className="block text-2xl font-bold text-slate-200 capitalize">{topic}</span>
               </div>
            </div>
            
            <div className="px-6 py-10 sm:px-12 space-y-10 relative">
               
               <div>
                  <h3 className="text-xl font-bold text-white flex items-center mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                    Communication Analysis
                  </h3>
                  <div className="text-slate-300 leading-relaxed bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
                    {evaluation.communication}
                  </div>
               </div>
               
               <div>
                  <h3 className="text-xl font-bold text-white flex items-center mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-3 border border-emerald-500/30">
                      <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    Code & Logic Analysis
                  </h3>
                  <div className="text-slate-300 leading-relaxed bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
                    {evaluation.logic}
                  </div>
               </div>
               
               <div>
                  <h3 className="text-xl font-bold text-white flex items-center mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/30">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                    </div>
                    Suggestions for Improvement
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluation.suggestions && evaluation.suggestions.map((sug, idx) => (
                      <li key={idx} className="bg-gradient-to-r from-slate-800/50 to-slate-800/20 p-4 rounded-xl border border-slate-700/30 text-slate-300 flex items-start">
                        <span className="text-purple-400 font-bold mr-3 mt-0.5">{idx + 1}.</span>
                        <span className="text-sm leading-relaxed">{sug}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview UI
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#0A0E17]">
      {!sessionInfo && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center pointer-events-none">
           <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
           <div className="animate-pulse text-2xl text-white font-bold tracking-tight">Preparing your interview room...</div>
        </div>
      )}
      
      {/* Top Banner indicating evaluating state */}
      {isEvaluating && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2.5 font-bold tracking-widest text-xs uppercase z-40 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse border-b border-indigo-400 relative">
          <div className="absolute inset-0 bg-white/20 animate-ping"></div>
          Analyzing transcript and computing your final score...
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden relative transition-opacity duration-500" style={{ opacity: isEvaluating ? 0.3 : 1, pointerEvents: isEvaluating ? 'none' : 'auto' }}>
        
        {/* Left panel: Chat and Problem */}
        <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-900 relative">
          
          {/* Subtle gradient behind chat */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none"></div>

          <div className="p-5 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 shadow-sm">
            <h2 className="font-bold text-white capitalize flex items-center text-lg tracking-tight">
              <Bot className="w-5 h-5 text-indigo-400 mr-2" /> {topic} Interview
            </h2>
            <div className="flex space-x-2">
              <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                In Progress
              </span>
            </div>
          </div>
          
          {/* Chat window */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-sm border border-indigo-500 shadow-indigo-500/20' 
                      : 'bg-slate-800 border-slate-700 text-slate-200 rounded-bl-sm border shadow-black/20'
                 }`}>
                   
                   {/* Avatar logic */}
                   <div className={`flex items-center mb-2 text-[10px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'justify-end text-indigo-200' : 'text-slate-400'}`}>
                     {msg.role === 'user' ? (
                       <><span className="mr-1.5">You</span><User className="w-3 h-3" /></>
                     ) : (
                       <><Bot className="w-3 h-3 mr-1.5 text-indigo-400" /><span>AI Interviewer</span></>
                     )}
                   </div>

                   {msg.role === 'user' ? (
                     <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                   ) : (
                     renderBotMessage(msg.content)
                   )}
                 </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          {/* Chat input */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md z-10">
            <div className="flex space-x-2 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl bg-slate-800/50 border border-slate-700 transition-all">
              <button 
                onClick={toggleListening}
                className={`p-3 rounded-l-xl transition-colors focus:outline-none flex items-center justify-center border-r border-slate-700 ${isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title={isListening ? 'Stop listening' : 'Start speaking'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input 
                type="text" 
                className="flex-1 bg-transparent text-white placeholder-slate-500 sm:text-sm px-4 py-3 outline-none"
                placeholder="Discuss your approach..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button 
                onClick={handleSendChat}
                className="px-5 py-3 text-indigo-400 hover:text-white hover:bg-indigo-500 rounded-r-xl transition-all focus:outline-none flex items-center group font-medium text-sm"
              >
                <span className="mr-2 group-hover:block hidden transition-all">Send</span>
                <Send size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right panel: Code Editor and Terminal */}
        <div className="w-2/3 flex flex-col bg-[#0A0E17]">
          {/* Editor Toolbar */}
          <div className="bg-slate-900 border-b border-slate-800 flex justify-between items-center py-3 px-5 shadow-sm">
             <div className="flex items-center space-x-4">
               <div className="relative">
                 <select 
                    value={language}
                    onChange={handleLanguageChange}
                    className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold rounded-lg outline-none py-1.5 pl-3 pr-8 cursor-pointer hover:border-slate-500 focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                  >
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
               </div>
               <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest border-l border-slate-700 pl-4">solution_code</span>
             </div>
             <div className="flex space-x-3">
               <button 
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="px-5 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/50 hover:border-transparent text-emerald-400 hover:text-white text-sm rounded-lg flex items-center font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
               >
                 {isExecuting ? <RefreshCw size={14} className="mr-2 animate-spin" /> : <Play size={14} className="mr-2" />}
                 {isExecuting ? 'RUNNING' : 'RUN'}
               </button>
               <button 
                  onClick={handleEndInterview}
                  className="px-5 py-2 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/50 hover:border-transparent text-rose-400 hover:text-white text-sm rounded-lg flex items-center font-bold tracking-wide transition-all shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
               >
                 <StopCircle size={14} className="mr-2" /> 
                 SUBMIT
               </button>
             </div>
          </div>
          
          {/* Monaco Editor */}
          <div className="flex-1 relative pt-2">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                wordWrap: 'on',
                lineHeight: 24,
                padding: { top: 16 },
                scrollbar: {
                   verticalScrollbarSize: 8,
                   horizontalScrollbarSize: 8,
                },
              }}
            />
          </div>
          
          {/* Output Terminal */}
          <div className="h-64 border-t border-slate-800 bg-[#0A0E17] text-white flex flex-col shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
             <div className="bg-slate-900 border-b border-slate-800 px-5 py-2.5 flex justify-between items-center shadow-sm">
               <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 flex items-center">
                 <TerminalIcon className="w-3.5 h-3.5 mr-2" /> Terminal Output
               </span>
               {executionResult && executionResult.status && (
                 <span className={`flex items-center space-x-1.5 px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${['Accepted', 'MOCK/STUB'].some(s => executionResult.status.description?.includes(s)) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                   <CheckCircle size={12} />
                   <span>{executionResult.status.description}</span>
                   {executionResult.time && <span className="opacity-70 ml-1 border-l border-current pl-1">({executionResult.time}s)</span>}
                 </span>
               )}
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {!executionResult && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                    <TerminalIcon className="w-10 h-10 opacity-20" />
                    <p className="italic text-xs tracking-wider">Run your code to see console output...</p>
                  </div>
                )}
                {executionResult && (
                  <div className="space-y-4">
                    {executionResult.stdout && (
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block mb-2">Standard Output</span>
                        <div className="text-emerald-400 whitespace-pre-wrap">{executionResult.stdout}</div>
                      </div>
                    )}
                    {executionResult.stderr && (
                      <div className="bg-rose-950/20 p-4 rounded-lg border border-rose-900/30 mt-2">
                        <span className="text-rose-500/70 text-[10px] uppercase font-bold tracking-widest block mb-2">Error / Compilation Output</span>
                        <div className="text-rose-400 whitespace-pre-wrap">{executionResult.stderr}</div>
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
