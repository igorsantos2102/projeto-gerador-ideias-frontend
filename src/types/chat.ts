export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string | Date | null;
  tokensInput?: number | null;
  tokensOutput?: number | null;
  totalTokens?: number | null;
  tokensRemaining?: number | null;
};

export type ChatIdeaSummary = {
  ideaId: string;
  title: string;
  summary: string;
  createdAt?: string | null;
};

export type ChatSession = {
  sessionId: number;
  chatType: 'FREE' | 'IDEA_BASED';
  ideaId: string | null;
  ideaSummary: string | null;
  tokensInput: number;
  tokensOutput: number;
  totalTokens: number;
  tokensRemaining: number;
  lastResetAt: string | null;
  messages: ChatMessage[];
  hasMoreMessages?: boolean;
};

