import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { WorkspaceState, PageMetadata, PageContent, Block, BlockType, Notification } from './types';
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
  | { type: 'MARK_NOTIFICATIONS_READ' };

const defaultState: WorkspaceState = {
  pages: INITIAL_PAGES,
  content: INITIAL_CONTENT,
  notifications: [
      { id: 'n1', text: "Notion AI: I've summarized your meeting notes.", time: '2m ago', read: false, pageId: 'root-3' },
      { id: 'n2', text: "Engineering Team mentioned you in 'API Status'.", time: '1h ago', read: false, pageId: 'root-2' },
      { id: 'n3', text: "Welcome to Filebox! Try the new Calendar view.", time: '1d ago', read: true, pageId: 'root-1' }
  ],
  currentPageId: 'root-1',
  sidebarWidth: 240,
  isDarkMode: false,
  user: {
    name: "Demo User",
    email: "demo@example.com",
    avatar: "https://i.pravatar.cc/150?u=notion"
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
      // Merge with default to ensure new fields (like UI) exist
      return { ...defaultState, ...parsed, ui: { ...defaultState.ui, ...parsed.ui } };
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return defaultState;
};

// Helper to find and update a block deeply (for nested blocks)
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

// Reducer
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
         // Handle top-level properties like 'isOpen' for toggles separately if they aren't in 'properties' bag
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
    default:
      return state;
  }
};

// Context
interface StoreContextType {
  state: WorkspaceState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, loadState());

  // Persistence
  useEffect(() => {
    localStorage.setItem('filebox-state', JSON.stringify({
        pages: state.pages,
        content: state.content,
        notifications: state.notifications,
        currentPageId: state.currentPageId,
        isDarkMode: state.isDarkMode,
        user: state.user,
        ui: state.ui
    }));
  }, [state]);

  // Sync theme
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
