
import React, { useState } from 'react';
import { useStore } from '../../store';
import { 
  Github, 
  ExternalLink, 
  ChevronDown, 
  Search, 
  Bell, 
  Activity, 
  Terminal, 
  History, 
  MoreVertical,
  ChevronRight,
  Maximize2,
  Grid
} from 'lucide-react';

const DeploymentView: React.FC = () => {
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    'Overview', 'Deployments', 'Analytics', 'Speed Insights', 'Logs', 'Observability', 
    'Redirects', 'Firewall', 'AI Gateway', 'Sandboxes', 'Storage', 'Flags', 'Settings'
  ];

  return (
    <div className="flex-1 flex flex-col bg-black text-white font-sans overflow-y-auto selection:bg-[#0070f3] selection:text-white h-full">
      {/* Top Navbar */}
      <nav className="border-b border-[#333] px-6 py-2.5 flex items-center justify-between bg-black sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-white">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <div className="flex items-center text-sm font-medium">
            <span className="text-[#888] hover:text-white cursor-pointer transition-colors">ko-il's projects</span>
            <div className="mx-2 bg-[#333] w-px h-4 transform rotate-12"></div>
            <div className="flex items-center space-x-1 hover:text-[#888] cursor-pointer transition-colors">
               <span className="bg-gradient-to-tr from-yellow-400 to-green-500 w-4 h-4 rounded-full"></span>
               <span>filebox</span>
               <ChevronDown size={14} className="text-[#888]" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Find..." 
              className="bg-[#111] border border-[#333] rounded-md pl-9 pr-8 py-1.5 text-xs w-56 focus:border-[#666] outline-none transition-all focus:w-64"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-[#333] px-1.5 py-0.5 rounded text-[#888] font-mono">F</span>
          </div>
          <button className="text-xs text-[#888] hover:text-white font-medium transition-colors">Feedback</button>
          <Bell size={18} className="text-[#888] hover:text-white cursor-pointer transition-colors" />
          <div className="w-8 h-8 rounded-full border border-[#333] overflow-hidden cursor-pointer hover:border-white transition-colors">
             <img src={state.user.avatar} alt="User" />
          </div>
        </div>
      </nav>

      {/* Sub Navbar (Tabs) */}
      <div className="px-6 border-b border-[#333] bg-black sticky top-[53px] z-40">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-white text-white' 
                  : 'border-transparent text-[#888] hover:text-white hover:bg-[#111]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1200px] mx-auto w-full px-6 py-10 flex flex-col">
        
        {/* Project Title and Header Buttons */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold tracking-tight">filebox</h1>
          <div className="flex items-center space-x-2.5">
            <button className="flex items-center px-4 py-2 bg-[#111] border border-[#333] rounded-md text-sm font-medium hover:bg-white hover:text-black hover:border-white transition-all">
              <Github size={16} className="mr-2" /> Repository
            </button>
            <button className="px-4 py-2 bg-[#111] border border-[#333] rounded-md text-sm font-medium hover:border-white transition-all">
              Usage
            </button>
            <button className="px-4 py-2 bg-[#111] border border-[#333] rounded-md text-sm font-medium hover:border-white transition-all">
              Domains
            </button>
            <div className="flex">
              <button className="px-5 py-2 bg-white text-black text-sm font-bold rounded-l-md hover:bg-[#ccc] transition-all">
                Visit
              </button>
              <button className="px-2 py-2 bg-white text-black border-l border-[#ddd] rounded-r-md hover:bg-[#ccc] transition-all">
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Section Title: Production Deployment */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Production Deployment</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3.5 py-1.5 bg-[#111] border border-[#333] rounded-md text-xs font-medium hover:border-white transition-all">
              Build Logs
            </button>
            <button className="px-3.5 py-1.5 bg-[#111] border border-[#333] rounded-md text-xs font-medium hover:border-white transition-all">
              Runtime Logs
            </button>
            <button className="flex items-center px-3.5 py-1.5 bg-black border border-[#333] rounded-md text-xs font-medium hover:bg-[#111] transition-all text-[#888]">
              <History size={14} className="mr-2" /> Instant Rollback
            </button>
          </div>
        </div>

        {/* Main Production Card */}
        <div className="bg-[#000] border border-[#333] rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col lg:flex-row h-auto lg:h-[420px]">
            
            {/* Preview Window (Left) */}
            <div className="lg:w-[60%] bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-[#333] p-8 flex items-center justify-center relative group">
              <div className="w-full h-full bg-white rounded shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Visual representation of the deployed app */}
                <div className="w-full h-full flex flex-col p-6 bg-white">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-5 h-5 bg-[#0070f3] rounded text-white text-[10px] font-bold flex items-center justify-center">F</div>
                    <div className="h-4 w-24 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="h-8 w-3/4 bg-gray-100 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-50 rounded"></div>
                    <div className="h-4 w-full bg-gray-50 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-50 rounded"></div>
                  </div>
                  <div className="mt-auto h-32 w-full bg-gray-50 rounded border border-dashed border-gray-200"></div>
                </div>
              </div>
              <button className="absolute top-4 right-4 p-2 bg-black/60 border border-[#333] rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:border-white">
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Metadata (Right) */}
            <div className="lg:w-[40%] p-8 flex flex-col justify-center space-y-7">
              <div>
                <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Deployment</span>
                <span className="text-sm font-medium hover:text-[#0070f3] cursor-pointer transition-colors block truncate">filebox-qbf8rwjk7-ko-i1s-projects.vercel.app</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Domains</span>
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <span className="text-sm font-bold border-b border-transparent group-hover:border-white">filebox-one.vercel.app</span>
                  <ExternalLink size={14} className="text-[#888]" />
                </div>
              </div>

              <div className="flex space-x-12">
                <div>
                  <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Status</span>
                  <div className="flex items-center text-sm font-bold">
                    <span className="w-2.5 h-2.5 bg-[#50e3c2] rounded-full mr-2.5 shadow-[0_0_10px_rgba(80,227,194,0.5)]"></span>
                    Ready
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Created</span>
                  <div className="flex items-center text-sm font-medium">
                    <span className="mr-2">4m ago by {state.user.name}</span>
                    <img src={state.user.avatar} className="w-5 h-5 rounded-full border border-[#333]" alt="User" />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider block mb-1">Source</span>
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center text-sm font-mono text-[#0070f3] hover:underline cursor-pointer">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current mr-2"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11zM8 4a4 4 0 100 8 4 4 0 000-8z" /></svg>
                    main
                  </div>
                  <div className="flex items-center text-[13px] text-[#888] font-mono">
                    <span className="mr-2 text-[#fff]">5c0cf4d</span>
                    <span className="truncate max-w-[280px]">feat: Initialize project structure and dependencies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-8 py-3.5 bg-[#111]/50 border-t border-[#333] flex items-center justify-between">
            <div className="flex items-center text-[13px] font-medium text-[#888] space-x-5">
              <button className="flex items-center hover:text-white transition-colors">
                <ChevronRight size={14} className="mr-1.5" /> Deployment Settings
              </button>
              <div className="bg-[#0070f31a] text-[#0070f3] px-2.5 py-0.5 rounded-full text-[11px] font-bold">4 Recommendations</div>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-8 text-sm text-[#888]">
          To update your Production Deployment, push to the <span className="text-white font-mono bg-[#111] px-1.5 py-0.5 rounded">main</span> branch.
        </div>
      </div>

      {/* Floating Vercel Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#333] px-6 py-2.5 flex items-center justify-between z-50 backdrop-blur-md bg-black/90">
        <div className="flex items-center space-x-6">
           <div className="flex items-center space-x-2.5 px-3 py-1 bg-[#111] border border-[#333] rounded-md hover:border-white hover:bg-black transition-all cursor-pointer group">
              <div className="flex space-y-1 flex-col w-4 h-4 justify-center">
                 <div className="h-[1.5px] w-full bg-[#888] group-hover:bg-white transition-colors"></div>
                 <div className="h-[1.5px] w-3/4 bg-[#888] group-hover:bg-white transition-colors"></div>
                 <div className="h-[1.5px] w-full bg-[#888] group-hover:bg-white transition-colors"></div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Deployments</span>
           </div>
           <div className="flex items-center space-x-2 text-[#888] hover:text-white cursor-pointer transition-colors">
              <Activity size={16} />
              <span className="text-xs font-medium">Monitoring</span>
           </div>
        </div>
        <div className="flex items-center text-[12px] text-[#888]">
          <div className="flex items-center mr-6 group cursor-pointer">
             <div className="w-2 h-2 rounded-full bg-[#50e3c2] mr-2 shadow-[0_0_8px_rgba(80,227,194,0.4)]"></div> 
             <span className="group-hover:text-white transition-colors">All systems normal</span>
          </div>
          <div className="flex items-center space-x-2.5">
             <button className="flex items-center hover:text-white transition-colors">
                Command Menu
             </button>
             <div className="flex items-center space-x-1">
                <span className="bg-[#111] border border-[#333] px-1.5 py-0.5 rounded text-[10px] font-mono">Ctrl</span>
                <span className="bg-[#111] border border-[#333] px-1.5 py-0.5 rounded text-[10px] font-mono">K</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeploymentView;
