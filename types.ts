
export type BlockType = 
  | 'text' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'bullet-list' 
  | 'numbered-list' 
  | 'todo' 
  | 'toggle' 
  | 'quote' 
  | 'code' 
  | 'divider' 
  | 'image'
  | 'table'
  | 'board'
  | 'calendar'
  | 'chart'
  | 'github'
  | 'jira'
  | 'video'
  | 'embed'
  | 'callout';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: Record<string, any>; // e.g., checked for todo, language for code, url for image, table data
  children?: Block[]; // For nested blocks like toggles
  isOpen?: boolean; // For toggles
}

export interface PageMetadata {
  id: string;
  icon: string;
  title: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  isExpanded?: boolean; // Sidebar UI state
  isFavorite?: boolean;
}

export interface PageContent {
  id: string; // Matches PageMetadata id
  coverImage?: string;
  blocks: Block[];
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
  pageId?: string;
}

export interface EnvVar {
  id: string;
  key: string;
  value: string;
}

export interface WorkspaceState {
  pages: Record<string, PageMetadata>;
  content: Record<string, PageContent>; // Loaded content cache
  notifications: Notification[];
  envVars: EnvVar[];
  currentPageId: string | null;
  sidebarWidth: number;
  isDarkMode: boolean;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  ui: {
    isSearchOpen: boolean;
    isSettingsOpen: boolean;
    isAIOpen: boolean;
    isTemplatesOpen: boolean;
    activeView: 'pages' | 'inbox' | 'deploy';
  }
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
