import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Code, Cpu, Globe, Rocket, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';

function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),theme(colors.slate.950))] opacity-40"></div>
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-white/5 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
            width={200}
            height={200}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" />
      </svg>

      {/* Hero Section */}
      <div className="px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                What's new
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-slate-300">
                <span>v1.0 is now live</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Master Your Next <span className="text-gradient-primary">Technical Interview</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Practice coding interviews with our advanced AI interviewer. Get real-time feedback, detailed evaluations, and improve your skills in DSA, DBMS, OS, and System Design.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              to="/signup"
              className="btn-primary"
            >
              Get started for free
            </Link>
            <Link to="/login" className="text-sm font-semibold leading-6 text-white flex items-center group">
              Sign in <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
        
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="glass-panel-dark -m-2 rounded-xl p-2 ring-1 ring-inset ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="bg-slate-950 rounded-lg overflow-hidden border border-white/5 shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">InterviewSession_DSA.js</div>
                </div>
                <div className="p-8 font-mono text-sm space-y-4">
                  <div className="text-indigo-400"># AI Interviewer</div>
                  <div className="text-slate-300">"Can you explain the time complexity of building a heap?"</div>
                  <div className="text-emerald-400 mt-8">// Your implementation</div>
                  <div className="text-slate-100">
                    def build_heap(arr):<br/>
                    &nbsp;&nbsp;n = len(arr)<br/>
                    &nbsp;&nbsp;for i in range(n // 2 - 1, -1, -1):<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;heapify(arr, n, i)
                  </div>
                  <div className="w-1 h-5 bg-indigo-500 animate-pulse inline-block"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">Interview Smarter</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to succeed
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Our platform provides a comprehensive suite of tools designed to simulate real-world technical interviews.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <Bot className="h-5 w-5 flex-none text-indigo-400" />
                AI-Powered Dialogue
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-300">
                <p className="flex-auto">Experience interactive sessions with an AI that understands your code and provides contextual hints.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <Code className="h-5 w-5 flex-none text-indigo-400" />
                Multi-Language Support
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-300">
                <p className="flex-auto">Write and execute code in Python, Java, or C++ directly in our integrated Monaco editor.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <Zap className="h-5 w-5 flex-none text-indigo-400" />
                Real-time Feedback
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-300">
                <p className="flex-auto">Get instant results for your code execution and AI feedback on your implementation approach.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white">AI</div>
            <span className="text-xl font-bold text-white tracking-tight">InterviewPro</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 AI InterviewPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
