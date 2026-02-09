
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
  | 'callout'
  | 'date' // New block type
  | 'database';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: Record<string, any>; // e.g., checked, date, reminderOption
  children?: Block[]; 
  isOpen?: boolean; 
}

export interface PageMetadata {
  id: string;
  icon: string;
  title: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  isExpanded?: boolean; 
  isFavorite?: boolean;
}

export interface PageContent {
  id: string; 
  coverImage?: string;
  blocks: Block[];
}

export interface Notification {
  id: string;
  type: 'reminder' | 'mention' | 'reply' | 'system';
  title: string; 
  context: string; 
  description?: string; 
  time: string;
  read: boolean;
  pageId?: string;
  sender?: { name: string; avatar: string };
  group?: 'Today' | 'Yesterday' | 'This Week' | 'Older';
}

export interface EnvVar {
  id: string;
  key: string;
  value: string;
}

export interface WorkspaceState {
  pages: Record<string, PageMetadata>;
  content: Record<string, PageContent>; 
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
    activeView: 'pages' | 'inbox';
  }
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
