import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { Send, Play, CheckCircle, Mic, MicOff, StopCircle, ArrowLeft } from 'lucide-react';

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
      <div className="text-sm space-y-2">
        {content.feedback && <p className="text-gray-800">🗣 {content.feedback}</p>}
        {content.hint && (
          <div className="bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200 text-xs">
            <strong>Hint:</strong> {content.hint}
          </div>
        )}
        {content.question && (
          <div className="bg-blue-50 text-blue-900 p-2 rounded border border-blue-200 mt-2">
            <span className="font-semibold block mb-1">Interviewer asks:</span>
            <span className="whitespace-pre-wrap">{content.question}</span>
          </div>
        )}
      </div>
    );
  };

  // Evaluation Map Display
  if (evaluation) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2"/> Back to Dashboard
        </button>
        
        <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 sm:px-10">
             <h2 className="text-3xl leading-9 font-extrabold text-white text-center">Interview Evaluation Summary</h2>
          </div>
          <div className="px-6 py-6 sm:px-10 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center">
             <div className="mb-4 sm:mb-0">
               <span className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Final Score</span>
               <span className="block text-4xl font-extrabold text-indigo-600">{evaluation.score}</span>
             </div>
             <div className="text-right">
               <span className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Topic</span>
               <span className="block text-xl font-bold text-gray-900 capitalize">{topic}</span>
             </div>
          </div>
          
          <div className="px-6 py-8 sm:px-10 space-y-8">
             <div>
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Communication Analysis</h3>
                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-gray-100">{evaluation.communication}</p>
             </div>
             
             <div>
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Code & Logic Analysis</h3>
                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-gray-100">{evaluation.logic}</p>
             </div>
             
             <div>
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Suggestions for Improvement</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {evaluation.suggestions && evaluation.suggestions.map((sug, idx) => (
                    <li key={idx} className="text-gray-700">{sug}</li>
                  ))}
                </ul>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview UI
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {!sessionInfo && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
           <div className="animate-pulse text-xl text-gray-500 font-semibold">Preparing your interview room...</div>
        </div>
      )}
      
      {/* Top Banner indicating evaluating state */}
      {isEvaluating && (
        <div className="bg-indigo-600 text-white text-center py-2 font-medium z-40 shadow-sm animate-pulse">
          Analyzing transcript and computing your final score...
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden relative" style={{ opacity: isEvaluating ? 0.5 : 1, pointerEvents: isEvaluating ? 'none' : 'auto' }}>
        {/* Left panel: Chat and Problem */}
        <div className="w-1/3 border-r flex flex-col bg-white">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 capitalize">{topic} Interview</h2>
            <div className="flex space-x-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">In Progress</span>
            </div>
          </div>
          
          {/* Chat window */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[90%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border text-gray-800 shadow-sm'}`}>
                   {msg.role === 'user' ? (
                     <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                   ) : (
                     renderBotMessage(msg.content)
                   )}
                 </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          {/* Chat input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <button 
                onClick={toggleListening}
                className={`p-2 rounded-md transition-colors focus:outline-none flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                title={isListening ? 'Stop listening' : 'Start speaking'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <input 
                type="text" 
                className="flex-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border outline-none"
                placeholder="Discuss your approach..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button 
                onClick={handleSendChat}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none flex items-center"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right panel: Code Editor and Terminal */}
        <div className="w-2/3 flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-[#1e1e1e] border-b border-gray-700 flex justify-between items-center p-2">
             <div className="text-gray-300 px-4 py-1 flex items-center space-x-3">
               <select 
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-gray-800 border border-gray-600 text-gray-300 text-sm rounded outline-none py-1 px-2 appearance-none cursor-pointer"
                >
                  <option value="python">Python 3</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
               </select>
               <span className="text-sm font-mono text-gray-400">solution code</span>
             </div>
             <div className="space-x-2 flex">
               <button 
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center font-medium transition-colors disabled:opacity-50"
               >
                 <Play size={14} className="mr-1.5" /> 
                 {isExecuting ? 'Running...' : 'Run Code'}
               </button>
               <button 
                  onClick={handleEndInterview}
                  className="ml-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center font-medium transition-colors"
               >
                 <StopCircle size={14} className="mr-1.5" /> 
                 Submit & Evaluate
               </button>
             </div>
          </div>
          
          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on'
              }}
            />
          </div>
          
          {/* Output Terminal */}
          <div className="h-56 border-t border-gray-700 bg-[#1e1e1e] text-white flex flex-col">
             <div className="bg-gray-800 text-xs px-4 py-2 uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 flex justify-between items-center">
               Output View
               {executionResult && executionResult.status && (
                 <span className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] ${['Accepted', 'MOCK/STUB'].some(s => executionResult.status.description?.includes(s)) ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                   <CheckCircle size={10} />
                   <span>{executionResult.status.description}</span>
                   {executionResult.time && <span>({executionResult.time}s)</span>}
                 </span>
               )}
             </div>
             <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed">
                {!executionResult && <div className="text-gray-500 italic">Run your code to see compilation and runtime results here...</div>}
                {executionResult && (
                  <>
                    {executionResult.stdout && (
                      <div className="mb-2">
                        <span className="text-gray-500 text-xs uppercase block mb-1">Standard Output</span>
                        <div className="text-green-400 whitespace-pre-wrap">{executionResult.stdout}</div>
                      </div>
                    )}
                    {executionResult.stderr && (
                      <div className="mt-2">
                        <span className="text-gray-500 text-xs uppercase block mb-1">Error/Compilation Output</span>
                        <div className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</div>
                      </div>
                    )}
                  </>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewSession;
