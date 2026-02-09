
import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import BlockEditor from './Editor/BlockEditor';
import { useStore } from '../store';
import { Menu, Share, MoreHorizontal, Clock, Star, Sun, Moon, Sparkles, Send } from 'lucide-react';

const Layout: React.FC = () => {
  const { state, dispatch } = useStore();
  const [isCopied, setIsCopied] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiChat, setAiChat] = useState<{role: 'user' | 'ai', text: string}[]>([
      { role: 'ai', text: 'Hi! I am your Notion Agent. I can help you summarize this page, rewrite text, or answer questions.' }
  ]);

  const currentPage = state.pages[state.currentPageId || ''];
  const isFavorite = currentPage?.isFavorite;

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFavorite = () => {
      if (state.currentPageId) {
          dispatch({ type: 'TOGGLE_FAVORITE', payload: state.currentPageId });
      }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!aiMessage.trim()) return;
      const userMsg = aiMessage;
      setAiChat(prev => [...prev, { role: 'user', text: userMsg }]);
      setAiMessage("");
      
      setTimeout(() => {
          setAiChat(prev => [...prev, { role: 'ai', text: `I've analyzed your request: "${userMsg}". Here is a summary of the current page context... (Mock Response)` }]);
      }, 1000);
  };

  const renderMainContent = () => {
      return (
        <div className="flex-1 overflow-y-auto px-12 md:px-24 pt-8 pb-32">
            <BlockEditor />
        </div>
      );
  };

  return (
    <div className="flex w-full h-full relative">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-notion-dark-bg transition-colors duration-300 relative">
        
        {/* Topbar */}
        <header className="h-12 flex items-center justify-between px-3 sticky top-0 z-10 bg-white dark:bg-notion-dark-bg transition-colors duration-300">
        <div className="flex items-center text-sm">
            <div className="flex items-center text-notion-text dark:text-notion-dark-text">
                <span className="truncate max-w-[200px]">{currentPage?.title || (state.ui.activeView === 'inbox' ? 'Inbox' : 'Loading...')}</span>
            </div>
        </div>
        
        <div className="flex items-center space-x-2 text-notion-dim">
            <button 
                onClick={handleShare}
                className="text-xs px-2 py-1 hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded transition-colors mr-2 hidden sm:block"
            >
                {isCopied ? "Copied Link!" : "Share"}
            </button>
            <button 
                onClick={() => dispatch({ type: 'TOGGLE_THEME' })} 
                className="p-1 hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded transition-colors"
                title="Toggle Theme"
            >
                {state.isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
                onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isAIOpen', value: !state.ui.isAIOpen } })} 
                className={`p-1 hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded transition-colors ${state.ui.isAIOpen ? 'text-purple-500' : ''}`}
                title="Notion AI"
            >
                <Sparkles size={18} />
            </button>
            <button 
                onClick={handleFavorite}
                className={`p-1 hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded transition-colors ${isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`}
                title="Favorite"
            >
                <Star size={18} className={isFavorite ? 'fill-current' : ''} />
            </button>
            <button className="p-1 hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded transition-colors">
                <MoreHorizontal size={18} />
            </button>
        </div>
        </header>

        {/* Editor Area / Content Area */}
        {renderMainContent()}

        {/* AI Assistant Sidebar (Floating) */}
        {state.ui.isAIOpen && (
            <div className="absolute top-12 right-4 bottom-4 w-80 bg-white dark:bg-notion-dark-sidebar border border-notion-border dark:border-notion-dark-border shadow-2xl rounded-lg flex flex-col z-20">
                <div className="p-3 border-b border-notion-border dark:border-notion-dark-border flex justify-between items-center bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center text-purple-600 dark:text-purple-300 font-semibold text-sm">
                        <Sparkles size={14} className="mr-2" /> Notion Agent
                    </div>
                    <button onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isAIOpen', value: false } })} className="text-gray-400 hover:text-gray-600">×</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {aiChat.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAiSubmit} className="p-3 border-t border-notion-border dark:border-notion-dark-border flex">
                    <input 
                        className="flex-1 bg-transparent text-sm outline-none text-notion-text dark:text-notion-dark-text" 
                        placeholder="Ask AI..." 
                        value={aiMessage}
                        onChange={(e) => setAiMessage(e.target.value)}
                    />
                    <button type="submit" className="text-notion-blue ml-2"><Send size={16} /></button>
                </form>
            </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
