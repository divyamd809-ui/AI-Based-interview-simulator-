import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { 
  Send, Play, CheckCircle, Mic, MicOff, StopCircle, ArrowLeft, 
  Terminal as TerminalIcon, Bot, User, AlertCircle, RefreshCw, Code 
} from 'lucide-react';

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
        feedback: `Hello! I'm your AI interviewer for ${topic?.toUpperCase()}. Let's get started. Generating your question...`,
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
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'code' | 'output'
  
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
      if (window.innerWidth < 768) setActiveTab('output');
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
    if (typeof content === 'string') return <p className="text-sm prose prose-invert">{content}</p>;
    
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
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-slate-950 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-indigo-400 hover:text-indigo-300 mb-8 transition-colors group bg-slate-900/50 px-4 py-2 rounded-full w-fit hover:bg-slate-900 border border-white/5"
          >
            <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
          </button>
          
          <div className="glass-panel-dark overflow-hidden rounded-3xl border border-white/5 relative shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

            <div className="relative px-6 py-10 sm:px-12 border-b border-white/5 text-center">
               <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Interview Summary</h2>
               <p className="text-slate-400">Detailed performance breakdown</p>
            </div>

            <div className="px-6 py-8 sm:px-12 bg-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5">
               <div className="text-center md:text-left">
                 <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Score</span>
                 <span className="block text-5xl font-extrabold text-gradient-primary">{evaluation.score}</span>
               </div>
               <div className="text-center md:text-right">
                 <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Topic</span>
                 <span className="block text-2xl font-bold text-white capitalize">{topic}</span>
               </div>
            </div>
            
            <div className="px-6 py-10 sm:px-12 space-y-10 relative">
               <div>
                  <h3 className="text-xl font-bold text-white flex items-center mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3 border border-indigo-500/30">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    Communication Feedback
                  </h3>
                  <div className="text-slate-300 leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                    {evaluation.communication}
                  </div>
               </div>
               
               <div>
                  <h3 className="text-xl font-bold text-white flex items-center mb-6">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/30">
                      <TerminalIcon className="w-4 h-4 text-purple-400" />
                    </div>
                    Technical Analysis
                  </h3>
                  <div className="text-slate-300 leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                    {evaluation.logic}
                  </div>
               </div>
               
               <div>
                  <h3 className="text-xl font-bold text-white flex items-center mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-3 border border-emerald-500/30">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    Key Suggestions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluation.suggestions && evaluation.suggestions.map((sug, idx) => (
                      <div key={idx} className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 text-slate-300 flex items-start">
                        <span className="text-indigo-400 font-bold mr-3 mt-0.5">{idx + 1}.</span>
                        <span className="text-sm leading-relaxed">{sug}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Interview UI
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {!sessionInfo && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
           <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 shadow-2xl animate-pulse">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
           </div>
           <div className="text-3xl text-white font-extrabold tracking-tight mb-2">Initializing Session</div>
           <p className="text-slate-500 text-lg">Your technical interviewer is preparing the problem set...</p>
        </div>
      )}
      
      {isEvaluating && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 font-bold tracking-widest text-xs uppercase z-[150] shadow-2xl animate-pulse">
          Crafting your comprehensive performance report...
        </div>
      )}

      {/* Mobile Component Tabs */}
      <div className="flex md:hidden bg-slate-900 border-b border-white/5 p-1.5 pt-3">
        {['chat', 'code', 'output'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-indigo-500/10 text-indigo-400 shadow-inner border border-indigo-500/20' 
                : 'text-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative transition-all duration-700" style={{ opacity: isEvaluating ? 0.3 : 1, filter: isEvaluating ? 'blur(4px)' : 'none', pointerEvents: isEvaluating ? 'none' : 'auto' }}>
        
        {/* Chat Panel */}
        <div className={`w-full md:w-1/3 h-full border-r border-white/5 flex flex-col bg-slate-900 relative ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-5 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
            <h2 className="font-bold text-white capitalize flex items-center text-lg tracking-tight">
              <Bot className="w-5 h-5 text-indigo-400 mr-2" /> {topic} Interview
            </h2>
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Interview</span>
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
                       <><span className="mr-2">Applicant</span><User size={12} /></>
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
            <div className="flex space-x-2 bg-slate-800/30 border border-white/5 rounded-2xl p-1.5 focus-within:border-indigo-500/30 transition-all">
              <button 
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              >
                {isListening ? <StopCircle size={18} /> : <Mic size={18} />}
              </button>
              <input 
                type="text" 
                className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm px-3 outline-none"
                placeholder="Type your response..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button 
                onClick={handleSendChat}
                className="p-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Editor & Terminal Container */}
        <div className={`flex-1 h-full flex flex-col bg-slate-950 ${activeTab !== 'chat' ? 'flex' : 'hidden md:flex'}`}>
          {/* Editor Header */}
          <div className={`flex flex-col min-h-0 ${activeTab === 'code' ? 'flex' : 'hidden md:flex flex-1'}`}>
            <div className="bg-slate-900/50 border-b border-white/5 py-4 px-6 flex flex-wrap justify-between items-center gap-4">
               <div className="flex items-center space-x-6">
                 <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <Code size={16} className="text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Main.{language === 'python' ? 'py' : language}</span>
                 </div>
                 <select 
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-xl px-4 py-2 outline-none hover:bg-white/10 transition-colors cursor-pointer"
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
                    className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-transparent text-emerald-400 hover:text-white text-[11px] font-bold rounded-xl flex items-center transition-all disabled:opacity-50"
                 >
                   {isExecuting ? <RefreshCw size={14} className="mr-2 animate-spin" /> : <Play size={14} className="mr-2" />}
                   {isExecuting ? 'EXECUTING' : 'RUN CODE'}
                 </button>
                 <button 
                    onClick={handleEndInterview}
                    className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white text-[11px] font-bold rounded-xl flex items-center transition-all"
                 >
                   <StopCircle size={14} className="mr-2" /> 
                   <span>TERMINATE</span>
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
          
          {/* Terminal / Output */}
          <div className={`h-full md:h-80 border-t border-white/5 bg-slate-950 flex flex-col ${activeTab === 'output' ? 'flex' : 'hidden md:flex'}`}>
             <div className="bg-slate-900 px-6 py-3 flex justify-between items-center border-b border-white/5">
                <span className="text-[11px] uppercase tracking-widest font-bold text-slate-500 flex items-center">
                  <TerminalIcon className="w-4 h-4 mr-2" /> Runtime Console
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
                  <div className="h-full flex flex-col items-center justify-center text-slate-800 opacity-50 space-y-4">
                    <TerminalIcon size={48} className="mb-2" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">Waiting for input execution...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {executionResult.stdout && (
                      <div className="animate-fade-in whitespace-pre-wrap leading-relaxed">
                        <span className="text-slate-600 block mb-3 font-sans font-bold text-[10px] uppercase tracking-widest">stdout</span>
                        <div className="text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-white/5">{executionResult.stdout}</div>
                      </div>
                    )}
                    {executionResult.stderr && (
                      <div className="animate-fade-in whitespace-pre-wrap leading-relaxed">
                        <span className="text-rose-500/50 block mb-3 font-sans font-bold text-[10px] uppercase tracking-widest">stderr / trace</span>
                        <div className="text-rose-400 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">{executionResult.stderr}</div>
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
