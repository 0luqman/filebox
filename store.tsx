
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { WorkspaceState, PageMetadata, PageContent, Block, BlockType, Notification, EnvVar } from './types';
import { INITIAL_PAGES, INITIAL_CONTENT, generateId } from './utils';

// Actions
type Action =
  | { type: 'SET_PAGE'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_PAGE'; payload: { title: string; parentId: string | null; blocks?: Block[] } }
  | { type: 'UPDATE_BLOCKS'; payload: { pageId: string; blocks: Block[] } }
  | { type: 'UPDATE_BLOCK_PROP'; payload: { pageId: string; blockId: string; key: string; value: any } }
  | { type: 'UPDATE_PAGE_TITLE'; payload: { pageId: string; title: string; icon?: string } }
  | { type: 'TOGGLE_SIDEBAR_NODE'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'SET_UI_STATE'; payload: { key: keyof WorkspaceState['ui']; value: any } }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'UPDATE_ENV_VAR'; payload: { id: string; key?: string; value?: string } }
  | { type: 'ADD_ENV_VAR' }
  | { type: 'REMOVE_ENV_VAR'; payload: string };

const defaultState: WorkspaceState = {
  pages: INITIAL_PAGES,
  content: INITIAL_CONTENT,
  notifications: [
      { id: 'n1', text: "Notion AI: I've summarized your meeting notes.", time: '2m ago', read: false, pageId: 'root-3' },
      { id: 'n2', text: "Engineering Team mentioned you in 'API Status'.", time: '1h ago', read: false, pageId: 'root-2' },
      { id: 'n3', text: "Welcome to Filebox! Try the new Calendar view.", time: '1d ago', read: true, pageId: 'root-1' }
  ],
  envVars: [
    { id: '1', key: 'API_KEY', value: 'AlzaSyAty3d38TobHA_7...' },
    { id: '2', key: 'GEMINI_API_KEY', value: 'AlzaSyAty3d38TobHA_7...' },
    { id: '3', key: 'GOOGLE_API_KEY', value: 'AlzaSyAty3d38TobHA_7...' }
  ],
  currentPageId: 'root-1',
  sidebarWidth: 240,
  isDarkMode: false,
  user: {
    name: "Oluqman",
    email: "oluqman@example.com",
    avatar: "https://i.pravatar.cc/150?u=olu"
  },
  ui: {
    isSearchOpen: false,
    isSettingsOpen: false,
    isAIOpen: false,
    isTemplatesOpen: false,
    activeView: 'pages'
  }
};

// Load from local storage
const loadState = (): WorkspaceState => {
  try {
    const saved = localStorage.getItem('filebox-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure activeView is valid if state was saved during 'deploy' view
      const activeView = (parsed.ui?.activeView === 'deploy') ? 'pages' : (parsed.ui?.activeView || 'pages');
      
      return { 
          ...defaultState, 
          ...parsed, 
          ui: { ...defaultState.ui, ...parsed.ui, activeView } 
      };
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return defaultState;
};

const updateBlockInTree = (blocks: Block[], blockId: string, updater: (b: Block) => Block): Block[] => {
  return blocks.map(block => {
    if (block.id === blockId) {
      return updater(block);
    }
    if (block.children) {
      return { ...block, children: updateBlockInTree(block.children, blockId, updater) };
    }
    return block;
  });
};

const reducer = (state: WorkspaceState, action: Action): WorkspaceState => {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPageId: action.payload, ui: { ...state.ui, activeView: 'pages' } };
    case 'TOGGLE_THEME':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'SET_UI_STATE':
      return { ...state, ui: { ...state.ui, [action.payload.key]: action.payload.value } };
    case 'TOGGLE_SIDEBAR_NODE': {
      const page = state.pages[action.payload];
      if (!page) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.payload]: { ...page, isExpanded: !page.isExpanded }
        }
      };
    }
    case 'TOGGLE_FAVORITE': {
      const page = state.pages[action.payload];
      if (!page) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.payload]: { ...page, isFavorite: !page.isFavorite }
        }
      };
    }
    case 'ADD_PAGE': {
      const newId = generateId();
      const newPage: PageMetadata = {
        id: newId,
        icon: '📄',
        title: action.payload.title || 'Untitled',
        parentId: action.payload.parentId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isExpanded: false
      };
      const parentUpdates = action.payload.parentId ? {
        [action.payload.parentId]: { ...state.pages[action.payload.parentId], isExpanded: true }
      } : {};

      const initialBlocks = action.payload.blocks || [{ id: generateId(), type: 'text', content: '' }];

      return {
        ...state,
        pages: { ...state.pages, ...parentUpdates, [newId]: newPage },
        content: {
          ...state.content,
          [newId]: { id: newId, blocks: initialBlocks }
        },
        currentPageId: newId,
        ui: { ...state.ui, activeView: 'pages' }
      };
    }
    case 'UPDATE_BLOCKS':
      return {
        ...state,
        content: {
          ...state.content,
          [action.payload.pageId]: {
            ...state.content[action.payload.pageId],
            blocks: action.payload.blocks
          }
        }
      };
    case 'UPDATE_BLOCK_PROP': {
      const pageContent = state.content[action.payload.pageId];
      if (!pageContent) return state;
      
      const newBlocks = updateBlockInTree(pageContent.blocks, action.payload.blockId, (block) => {
         if (action.payload.key === 'isOpen') {
             return { ...block, isOpen: action.payload.value };
         }
         return {
             ...block,
             properties: { ...block.properties, [action.payload.key]: action.payload.value }
         };
      });

      return {
          ...state,
          content: {
              ...state.content,
              [action.payload.pageId]: { ...pageContent, blocks: newBlocks }
          }
      };
    }
    case 'UPDATE_PAGE_TITLE':
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.payload.pageId]: {
            ...state.pages[action.payload.pageId],
            title: action.payload.title,
            icon: action.payload.icon || state.pages[action.payload.pageId].icon
          }
        }
      };
    case 'DELETE_PAGE': {
        const { [action.payload]: deleted, ...remainingPages } = state.pages;
        return {
            ...state,
            pages: remainingPages,
            currentPageId: state.currentPageId === action.payload ? Object.keys(remainingPages)[0] || null : state.currentPageId
        }
    }
    case 'MARK_NOTIFICATIONS_READ':
        return {
            ...state,
            notifications: state.notifications.map(n => ({ ...n, read: true }))
        };
    case 'UPDATE_ENV_VAR':
      return {
        ...state,
        envVars: state.envVars.map(ev => 
          ev.id === action.payload.id ? { ...ev, ...action.payload } : ev
        )
      };
    case 'ADD_ENV_VAR':
      return {
        ...state,
        envVars: [...state.envVars, { id: generateId(), key: '', value: '' }]
      };
    case 'REMOVE_ENV_VAR':
      return {
        ...state,
        envVars: state.envVars.filter(ev => ev.id !== action.payload)
      };
    default:
      return state;
  }
};

interface StoreContextType {
  state: WorkspaceState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, loadState());

  useEffect(() => {
    localStorage.setItem('filebox-state', JSON.stringify({
        pages: state.pages,
        content: state.content,
        notifications: state.notifications,
        envVars: state.envVars,
        currentPageId: state.currentPageId,
        isDarkMode: state.isDarkMode,
        user: state.user,
        ui: state.ui
    }));
  }, [state]);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
