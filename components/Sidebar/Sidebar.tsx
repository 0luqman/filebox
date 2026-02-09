
import React, { useState } from 'react';
import { useStore } from '../../store';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Search, 
  Settings, 
  Trash,
  FilePlus,
  X,
  User,
  Monitor,
  Inbox,
  Sparkles,
  LayoutTemplate
} from 'lucide-react';
import { PageMetadata } from '../../types';

interface SidebarItemProps {
  page: PageMetadata;
  depth: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ page, depth }) => {
  const { state, dispatch } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const children = (Object.values(state.pages) as PageMetadata[]).filter(p => p.parentId === page.id);
  const isActive = state.currentPageId === page.id && state.ui.activeView === 'pages';
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_SIDEBAR_NODE', payload: page.id });
  };

  const handleClick = () => {
    dispatch({ type: 'SET_PAGE', payload: page.id });
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_PAGE', payload: { title: 'Untitled', parentId: page.id } });
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('Delete this page?')) {
          dispatch({ type: 'DELETE_PAGE', payload: page.id });
      }
  }

  return (
    <div className="select-none">
      <div 
        className={`group flex items-center py-1 px-2 min-h-[28px] cursor-pointer text-sm rounded-sm transition-colors ${
          isActive 
            ? 'bg-notion-hover dark:bg-notion-dark-hover font-medium text-notion-text dark:text-notion-dark-text' 
            : 'text-notion-dim hover:bg-notion-hover dark:hover:bg-notion-dark-hover'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          onClick={handleToggle}
          className={`mr-1 p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${children.length === 0 && 'opacity-0'}`}
        >
          {page.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        
        <span className="mr-2">{page.icon}</span>
        <span className="truncate flex-1">{page.title}</span>

        {(isHovered || isActive) && (
          <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100">
             <button onClick={handleDelete} className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded" title="Delete">
                <Trash size={14} />
             </button>
             <button onClick={handleAddChild} className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded" title="Add page inside">
                <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      {page.isExpanded && children.length > 0 && (
        <div>
          {children.map(child => (
            <SidebarItem key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-notion-dark-sidebar w-[500px] max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl border border-notion-border dark:border-notion-dark-border flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-notion-border dark:border-notion-dark-border">
                    <h2 className="font-semibold text-notion-text dark:text-notion-dark-text">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X size={18} /></button>
                </div>
                <div className="overflow-y-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Sidebar: React.FC = () => {
  const { state, dispatch } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  const allPages = Object.values(state.pages) as PageMetadata[];
  const rootPages = allPages.filter(p => p.parentId === null);
  const favoritePages = allPages.filter(p => p.isFavorite);
  const unreadCount = state.notifications.filter(n => !n.read).length;

  const filteredPages = searchQuery 
    ? allPages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <>
    <div className="flex flex-col h-full bg-notion-sidebar dark:bg-notion-dark-sidebar border-r border-notion-border dark:border-notion-dark-border w-60 flex-shrink-0 transition-colors duration-300">
      <div className="h-12 flex items-center px-4 hover:bg-notion-hover dark:hover:bg-notion-dark-hover cursor-pointer transition-colors m-2 rounded-md">
        <div className="w-5 h-5 bg-notion-blue text-white rounded flex items-center justify-center text-xs font-bold mr-2">
          F
        </div>
        <span className="text-sm font-medium text-notion-text dark:text-notion-dark-text truncate">Filebox</span>
        <ChevronDown size={14} className="ml-auto text-notion-dim" />
      </div>

      <div className="px-2 mb-4 space-y-0.5">
        <div 
            className="flex items-center px-3 py-1 text-sm text-notion-dim hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded cursor-pointer"
            onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isSearchOpen', value: true } })}
        >
            <Search size={16} className="mr-2" />
            <span>Search</span>
        </div>
        <div 
            className="flex items-center px-3 py-1 text-sm text-notion-dim hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded cursor-pointer"
            onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isAIOpen', value: true } })}
        >
            <Sparkles size={16} className="mr-2" />
            <span>Ask AI</span>
        </div>
        <div 
            className={`flex items-center px-3 py-1 text-sm hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded cursor-pointer ${state.ui.activeView === 'inbox' ? 'bg-notion-hover dark:bg-notion-dark-hover text-notion-text dark:text-notion-dark-text font-medium' : 'text-notion-dim'}`}
            onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'activeView', value: 'inbox' } })}
        >
            <div className="relative mr-2">
                <Inbox size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-notion-sidebar dark:border-notion-dark-sidebar"></span>
                )}
            </div>
            <span>Inbox</span>
            {unreadCount > 0 && <span className="ml-auto text-xs">{unreadCount}</span>}
        </div>
        <div 
            className="flex items-center px-3 py-1 text-sm text-notion-dim hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded cursor-pointer"
            onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isTemplatesOpen', value: true } })}
        >
            <LayoutTemplate size={16} className="mr-2" />
            <span>Templates</span>
        </div>
        <div 
            className="flex items-center px-3 py-1 text-sm text-notion-dim hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded cursor-pointer"
            onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isSettingsOpen', value: true } })}
        >
            <Settings size={16} className="mr-2" />
            <span>Settings</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {favoritePages.length > 0 && (
            <div className="mb-4">
                <div className="px-3 py-1 text-xs font-semibold text-notion-dim">Favorites</div>
                {favoritePages.map(page => (
                     <div 
                        key={page.id}
                        className={`flex items-center py-1 px-3 cursor-pointer text-sm rounded-sm transition-colors ${
                          state.currentPageId === page.id && state.ui.activeView === 'pages'
                            ? 'bg-notion-hover dark:bg-notion-dark-hover font-medium text-notion-text dark:text-notion-dark-text' 
                            : 'text-notion-dim hover:bg-notion-hover dark:hover:bg-notion-dark-hover'
                        }`}
                        onClick={() => dispatch({ type: 'SET_PAGE', payload: page.id })}
                     >
                         <span className="mr-2">{page.icon}</span>
                         <span className="truncate">{page.title}</span>
                     </div>
                ))}
            </div>
        )}

        <div className="px-3 py-1 text-xs font-semibold text-notion-dim">Private</div>
        {rootPages.map(page => (
          <SidebarItem key={page.id} page={page} depth={0} />
        ))}
      </div>

       <div className="p-2 border-t border-notion-border dark:border-notion-dark-border">
          <div 
            className="flex items-center px-3 py-1 text-sm text-notion-dim hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded cursor-pointer"
            onClick={() => dispatch({ type: 'ADD_PAGE', payload: { title: 'Untitled', parentId: null } })}
          >
              <Plus size={16} className="mr-2" />
              <span>New Page</span>
          </div>
       </div>
    </div>

    <Modal 
        isOpen={state.ui.isSearchOpen} 
        onClose={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isSearchOpen', value: false } })}
        title="Search"
    >
        <div className="flex flex-col">
            <input 
                autoFocus
                type="text" 
                placeholder="Search pages or web..." 
                className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 outline-none focus:ring-2 ring-notion-blue/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-y-1 max-h-64 overflow-y-auto">
                {searchQuery === "" && <div className="text-center text-gray-400 py-4">Type to search...</div>}
                {filteredPages.map(page => (
                    <div 
                        key={page.id} 
                        className="flex items-center p-2 hover:bg-notion-hover dark:hover:bg-notion-dark-hover rounded cursor-pointer"
                        onClick={() => {
                            dispatch({ type: 'SET_PAGE', payload: page.id });
                            dispatch({ type: 'SET_UI_STATE', payload: { key: 'isSearchOpen', value: false } });
                            setSearchQuery("");
                        }}
                    >
                        <span className="mr-2 text-xl">{page.icon}</span>
                        <div className="flex flex-col">
                            <span className="font-medium text-notion-text dark:text-notion-dark-text">{page.title}</span>
                            <span className="text-xs text-notion-dim">Open page</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </Modal>

    <Modal 
        isOpen={state.ui.isSettingsOpen} 
        onClose={() => dispatch({ type: 'SET_UI_STATE', payload: { key: 'isSettingsOpen', value: false } })}
        title="Settings & Members"
    >
        <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-4">
                <img src={state.user.avatar} className="w-16 h-16 rounded-full" alt="Profile" />
                <div>
                    <h3 className="font-bold text-lg">{state.user.name}</h3>
                    <p className="text-notion-dim">{state.user.email}</p>
                </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-xs font-semibold text-notion-dim uppercase mb-3">Appearance</h4>
                <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>
                    <div className="flex items-center">
                        <Monitor size={18} className="mr-2" />
                        <span>Theme</span>
                    </div>
                    <span className="text-sm text-notion-dim">{state.isDarkMode ? 'Dark' : 'Light'}</span>
                </div>
            </div>
        </div>
    </Modal>
    </>
  );
};

export default Sidebar;
