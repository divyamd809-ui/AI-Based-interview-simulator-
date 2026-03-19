import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { Send, Play, CheckCircle } from 'lucide-react';

function InterviewSession() {
  const { topic } = useParams();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [code, setCode] = useState('def solution():\n    # Write your code here\n    pass');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', content: `Hello! I'm your AI interviewer for ${topic.toUpperCase()}. Let's get started.` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    // Start interview session when component mounts
    startSession();
  }, [topic]);

  const startSession = async () => {
    try {
      const res = await api.post('/interview/start', { topic: topic.toUpperCase(), difficulty: 'Medium' });
      setSessionInfo(res.data);
      if (res.data.question) {
         setChatHistory(prev => [
           ...prev, 
           { role: 'bot', content: `Here is your first question: ${res.data.question.title}\n${res.data.question.description}` }
         ]);
      }
    } catch (err) {
      console.error(err);
    }
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
    try {
      const payload = { source_code: code, language_id: 71 };
      if (sessionInfo) payload.session_id = sessionInfo.sessionId;
      
      const res = await api.post('/code/execute', payload);
      setExecutionResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left panel: Chat and Problem */}
      <div className="w-1/3 border-r flex flex-col bg-white">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 capitalize">{topic} Interview</h2>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">In Progress</span>
        </div>
        
        {/* Chat window */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                 <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
               </div>
            </div>
          ))}
        </div>
        
        {/* Chat input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <input 
              type="text" 
              className="flex-1 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border outline-none"
              placeholder="Type your message..."
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
        <div className="bg-[#1e1e1e] border-b border-gray-700 flex justify-between p-2">
           <div className="text-gray-300 px-4 py-1 flex items-center">
             <span className="text-sm font-mono text-yellow-500 mr-2">Python</span> 
             solution.py
           </div>
           <div className="space-x-2">
             <button 
                onClick={handleRunCode}
                disabled={isExecuting}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center font-medium transition-colors disabled:opacity-50"
             >
               <Play size={14} className="mr-1.5" /> 
               {isExecuting ? 'Running...' : 'Run Code'}
             </button>
           </div>
        </div>
        
        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="python"
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
        <div className="h-48 border-t border-gray-700 bg-[#1e1e1e] text-white flex flex-col">
           <div className="bg-gray-800 text-xs px-4 py-1 uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-700 flex justify-between">
             Output View
             {executionResult && executionResult.status && (
               <span className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] ${executionResult.status.description === 'Accepted' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                 <CheckCircle size={10} />
                 <span>{executionResult.status.description}</span>
                 {executionResult.time && <span>({executionResult.time}s)</span>}
               </span>
             )}
           </div>
           <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {!executionResult && <div className="text-gray-500 italic">Run your code to see results here...</div>}
              {executionResult && (
                <>
                  {executionResult.stdout && <div className="text-green-400 whitespace-pre-wrap">{executionResult.stdout}</div>}
                  {executionResult.stderr && <div className="text-red-400 whitespace-pre-wrap mt-2">{executionResult.stderr}</div>}
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewSession;
