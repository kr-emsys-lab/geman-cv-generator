export interface AIProviders {
  openai: {
    apiKey: string;
    model: 'gpt-4o' | 'gpt-4o-mini';
    enabled: boolean;
  };
  gemini: {
    apiKey: string;
    model: 'gemini-1.5-pro' | 'gemini-2.0-flash-exp';
    enabled: boolean;
  };
  anthropic: {
    apiKey: string;
    model: 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022';
    enabled: boolean;
  };
  activeProvider: 'openai' | 'gemini' | 'anthropic';
}

export const defaultAIProviders: AIProviders = {
  openai: { apiKey: '', model: 'gpt-4o', enabled: false },
  gemini: { apiKey: '', model: 'gemini-1.5-pro', enabled: false },
  anthropic: { apiKey: '', model: 'claude-3-5-sonnet-20241022', enabled: false },
  activeProvider: 'openai'
};