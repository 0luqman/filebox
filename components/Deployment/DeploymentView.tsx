
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
  Maximize2
} from 'lucide-react';

const DeploymentView: React.FC = () => {
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    'Overview', 'Deployments', 'Analytics', 'Speed Insights', 'Logs', 'Observability', 
    'Redirects', 'Firewall', 'AI Gateway', 'Sandboxes', 'Storage', 'Flags', 'Settings'
  ];

  return (
    <div className="flex-1 flex flex-col bg-black text-white font-sans overflow-y-auto">
      {/* Vercel Header */}
      <nav className="border-b border-[#333] px-6 py-3 flex items-center justify-between bg-black sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-white">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>
          <div className="flex items-center text-sm font-medium">
            <span className="text-[#888] hover:text-white cursor-pointer">ko-il's projects</span>
            <span className="mx-2 text-[#444]">/</span>
            <div className="flex items-center bg-[#111] border border-[#333] rounded-full px-2 py-0.5 hover:border-white transition-colors cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 to-green-500 mr-2"></div>
              <span>filebox</span>
              <ChevronDown size={14} className="ml-1 text-[#888]" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
            <input 
              type="text" 
              placeholder="Find..." 
              className="bg-[#111] border border-[#333] rounded-md pl-10 pr-4 py-1.5 text-sm w-64 focus:border-[#666] outline-none transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-[#333] px-1.5 py-0.5 rounded text-[#888]">F</span>
          </div>
          <button className="text-sm text-[#888] hover:text-white font-medium">Feedback</button>
          <Bell size={18} className="text-[#888] hover:text-white cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border border-[#333] cursor-pointer"></div>
        </div>
      </nav>

      {/* Vercel Sub-tabs */}
      <div className="px-6 border-b border-[#333] bg-black">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-white text-white' 
                  : 'border-transparent text-[#888] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto w-full px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold tracking-tight">filebox</h1>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-[#111] border border-[#333] rounded-md text-sm font-medium hover:border-white transition-all">
              <Github size={16} className="mr-2" /> Repository
            </button>
            <button className="px-4 py-2 bg-[#111] border border-[#333] rounded-md text-sm font-medium hover:border-white transition-all">
              Usage
            </button>
            <button className="px-4 py-2 bg-[#111] border border-[#333] rounded-md text-sm font-medium hover:border-white transition-all">
              Domains
            </button>
            <div className="flex rounded-md overflow-hidden">
              <button className="px-4 py-2 bg-white text-black text-sm font-bold hover:bg-[#ccc] transition-all">
                Visit
              </button>
              <button className="px-2 py-2 bg-white text-black border-l border-[#ccc] hover:bg-[#ccc] transition-all">
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Production Deployment Card Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Production Deployment</h2>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-1.5 bg-[#111] border border-[#333] rounded-md text-xs font-medium hover:border-white transition-all">
              Build Logs
            </button>
            <button className="flex items-center px-4 py-1.5 bg-[#111] border border-[#333] rounded-md text-xs font-medium hover:border-white transition-all">
              Runtime Logs
            </button>
            <button className="flex items-center px-4 py-1.5 bg-[#111] border border-[#333] rounded-md text-xs font-medium hover:border-white transition-all text-red-400 border-red-900/30">
              <History size={14} className="mr-2" /> Instant Rollback
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-black border border-[#333] rounded-xl overflow-hidden shadow-2xl">
          <div className="flex h-[450px]">
            {/* Preview Section */}
            <div className="w-[60%] bg-[#080808] border-r border-[#333] p-8 flex items-center justify-center relative group">
              <div className="w-full h-full bg-white rounded shadow-2xl flex items-center justify-center">
                 {/* Visual Mock of the App */}
                 <div className="w-full h-full p-4 overflow-hidden">
                    <div className="flex mb-4">
                       <div className="w-4 h-4 rounded-full bg-gray-200 mr-2"></div>
                       <div className="w-32 h-4 bg-gray-100 rounded"></div>
                    </div>
                    <div className="space-y-2">
                       <div className="w-3/4 h-8 bg-gray-50 rounded"></div>
                       <div className="w-full h-32 bg-gray-50 rounded"></div>
                    </div>
                 </div>
              </div>
              <button className="absolute top-4 right-4 p-2 bg-black/50 border border-[#333] rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Info Section */}
            <div className="w-[40%] p-8 space-y-8 flex flex-col justify-center">
              <div>
                <label className="text-xs text-[#888] font-medium block mb-1">Deployment</label>
                <div className="text-sm font-medium">filebox-qbf8rwjk7-ko-i1s-projects.vercel.app</div>
              </div>

              <div>
                <label className="text-xs text-[#888] font-medium block mb-1">Domains</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">filebox-one.vercel.app</span>
                  <ExternalLink size={14} className="text-[#888]" />
                </div>
              </div>

              <div className="flex space-x-12">
                <div>
                  <label className="text-xs text-[#888] font-medium block mb-1">Status</label>
                  <div className="flex items-center text-sm font-semibold">
                    <span className="w-2 h-2 bg-[#00ff00] rounded-full mr-2 shadow-[0_0_8px_rgba(0,255,0,0.5)]"></span>
                    Ready
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#888] font-medium block mb-1">Created</label>
                  <div className="flex items-center text-sm font-medium">
                    <span className="mr-2">4m ago by Oluqman</span>
                    <img src="https://i.pravatar.cc/150?u=olu" className="w-5 h-5 rounded-full border border-[#333]" alt="Avatar" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#888] font-medium block mb-1">Source</label>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-sm font-mono text-[#0070f3]">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current mr-2"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11zM8 4a4 4 0 100 8 4 4 0 000-8z" /></svg>
                    main
                  </div>
                  <div className="flex items-center text-xs text-[#888] font-mono">
                    <span className="mr-2">5c0cf4d</span>
                    <span className="truncate">feat: Initialize project structure and dependencies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-8 py-3 bg-[#080808] border-t border-[#333] flex items-center justify-between">
            <div className="flex items-center text-xs text-[#888] space-x-4">
              <button className="flex items-center hover:text-white transition-colors">
                <ChevronRight size={14} className="mr-2" /> Deployment Settings
              </button>
              <div className="bg-[#0070f31a] text-[#0070f3] px-2 py-0.5 rounded-full font-bold">4 Recommendations</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-[#888]">
          To update your Production Deployment, push to the <span className="text-white font-mono">main</span> branch.
        </div>
      </div>

      {/* Vercel Status Bar Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#333] px-6 py-2 flex items-center justify-between z-50">
        <div className="flex items-center space-x-6">
           <div className="flex items-center space-x-2 px-3 py-1 bg-[#111] border border-[#333] rounded hover:border-white transition-all cursor-pointer">
              <div className="flex space-y-1 flex-col w-4 h-4 justify-center">
                 <div className="h-0.5 w-full bg-[#888]"></div>
                 <div className="h-0.5 w-3/4 bg-[#888]"></div>
                 <div className="h-0.5 w-full bg-[#888]"></div>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Deployments</span>
           </div>
           <Activity size={16} className="text-[#888] hover:text-white cursor-pointer" />
        </div>
        <div className="flex items-center text-xs text-[#888]">
          <span className="flex items-center mr-4">
             <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> All systems normal
          </span>
          <button className="flex items-center hover:text-white transition-colors">
             Command Menu <span className="ml-2 bg-[#333] px-1.5 py-0.5 rounded text-[10px]">Ctrl K</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default DeploymentView;
