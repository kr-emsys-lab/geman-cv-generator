import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { AIProviders } from '../types/ai-providers';

interface AIPolishRequest {
  text: string;
  context: {
    section: 'experience' | 'education' | 'skills' | 'projects' | 'certificates' | 'hobbies';
    jobTitle?: string;
    company?: string;
    language: 'de' | 'en';
  };
  mode: 'standard' | 'ats-optimized';
}

interface AIPolishResponse {
  polishedText: string;
  suggestions?: string[];
}

class AIService {
  private providers: AIProviders | null = null;

  setProviders(providers: AIProviders) {
    this.providers = providers;
  }

  clearProviders() {
    this.providers = null;
  }

  isConfigured(): boolean {
    if (!this.providers) return false;
    const activeProvider = this.providers[this.providers.activeProvider];
    return activeProvider.enabled && !!activeProvider.apiKey;
  }

  validateApiKey(key: string): boolean {
    // Basic format validation for each provider
    return key.startsWith('sk-proj-') || key.startsWith('sk-') || // OpenAI
           key.startsWith('AI') || // Google Gemini
           key.startsWith('sk-ant-'); // Anthropic
  }

  private getProvider() {
    if (!this.providers) throw new Error('No providers configured');

    const activeProvider = this.providers.activeProvider;
    const config = this.providers[activeProvider];

    if (!config.enabled || !config.apiKey) {
      throw new Error(`Provider ${activeProvider} not configured`);
    }

    switch (activeProvider) {
      case 'openai':
        return openai(config.model, { apiKey: config.apiKey });
      case 'gemini':
        return google(config.model, { apiKey: config.apiKey });
      case 'anthropic':
        return anthropic(config.model, { apiKey: config.apiKey });
      default:
        throw new Error(`Unknown provider: ${activeProvider}`);
    }
  }

  private getSystemPrompt(language: 'de' | 'en', mode: 'standard' | 'ats-optimized'): string {
    const basePrompt = language === 'de'
      ? `Du bist ein erfahrener deutscher HR-Experte und Karriereberater mit über 15 Jahren Erfahrung im deutschen Arbeitsmarkt. Du hilfst dabei, Lebensläufe nach deutschen Standards (DIN 5008) zu optimieren.`
      : `You are an experienced German HR expert and career consultant with over 15 years of experience in the German job market. You help optimize CVs according to German standards (DIN 5008).`;

    const modeInstructions = mode === 'ats-optimized'
      ? language === 'de'
        ? `
WICHTIG: Optimiere für ATS (Applicant Tracking Systems):
- Verwende Schlüsselwörter aus der Stellenausschreibung
- Nutze Standard-Berufsbezeichnungen und Branchenbegriffe
- Vermeide komplexe Formatierungen oder Sonderzeichen
- Strukturiere Informationen klar und scanbar
- Verwende messbare Erfolge mit Zahlen und Prozenten`
        : `
IMPORTANT: Optimize for ATS (Applicant Tracking Systems):
- Use keywords from job descriptions
- Use standard job titles and industry terms
- Avoid complex formatting or special characters
- Structure information clearly and scannably
- Use measurable achievements with numbers and percentages`
      : language === 'de'
        ? `
Optimiere für traditionelle deutsche Lebensläufe:
- Verwende formelle, professionelle Sprache
- Betone Qualifikationen und Verantwortlichkeiten
- Strukturiere chronologisch und übersichtlich
- Verwende deutsche Geschäftssprache`
        : `
Optimize for traditional German CVs:
- Use formal, professional language
- Emphasize qualifications and responsibilities
- Structure chronologically and clearly
- Use German business language conventions`;

    const guidelines = language === 'de'
      ? `
RICHTLINIEN:
1. Verwende starke Aktionsverben (entwickelte, leitete, optimierte, implementierte)
2. Quantifiziere Erfolge wo möglich (Zahlen, Prozente, Zeiträume)
3. Halte den ursprünglichen Sinn und die Fakten bei
4. Schreibe präzise und ohne Füllwörter
5. Verwende Fachterminologie angemessen
6. Strukturiere Aufzählungen logisch
7. Vermeide Übertreibungen oder Superlative
8. Fokussiere auf relevante Kompetenzen und Erfolge

ANTWORT: Gib nur den überarbeiteten Text zurück, ohne Kommentare oder Erklärungen.`
      : `
GUIDELINES:
1. Use strong action verbs (developed, led, optimized, implemented)
2. Quantify achievements where possible (numbers, percentages, timeframes)
3. Maintain original meaning and facts
4. Write precisely without filler words
5. Use technical terminology appropriately
6. Structure bullet points logically
7. Avoid exaggerations or superlatives
8. Focus on relevant competencies and achievements

RESPONSE: Return only the revised text, without comments or explanations.`;

    return `${basePrompt}\n${modeInstructions}\n${guidelines}`;
  }

  private getContextPrompt(context: AIPolishRequest['context'], language: 'de' | 'en'): string {
    const { section, jobTitle, company } = context;
    
    const sectionNames = {
      de: {
        experience: 'Berufserfahrung',
        education: 'Ausbildung',
        skills: 'Kenntnisse',
        projects: 'Projekte',
        certificates: 'Zertifikate',
        hobbies: 'Hobbys und Interessen'
      },
      en: {
        experience: 'Work Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Projects',
        certificates: 'Certificates',
        hobbies: 'Hobbies and Interests'
      }
    };

    let contextInfo = language === 'de' 
      ? `Bearbeite den folgenden Text aus dem Abschnitt "${sectionNames.de[section]}":`
      : `Edit the following text from the "${sectionNames.en[section]}" section:`;

    if (jobTitle && company) {
      contextInfo += language === 'de'
        ? ` (Position: ${jobTitle} bei ${company})`
        : ` (Position: ${jobTitle} at ${company})`;
    } else if (jobTitle) {
      contextInfo += language === 'de'
        ? ` (Position: ${jobTitle})`
        : ` (Position: ${jobTitle})`;
    }

    return contextInfo;
  }

  async polishText(request: AIPolishRequest): Promise<AIPolishResponse> {
    if (!this.isConfigured()) {
      throw new Error('AI service not configured. Please configure your API keys.');
    }

    const { text, context, mode } = request;
    const { language } = context;

    try {
      const systemPrompt = this.getSystemPrompt(language, mode);
      const contextPrompt = this.getContextPrompt(context, language);
      const userMessage = `${contextPrompt}\n\n${text}`;

      const provider = this.getProvider();
      const response = await generateText({
        model: provider,
        system: systemPrompt,
        prompt: userMessage,
        temperature: 0,
        maxTokens: 1024
      });

      const polishedText = response.text || text;

      return {
        polishedText: polishedText.trim(),
        suggestions: [] // Could be extended to provide additional suggestions
      };

    } catch (error) {
      console.error('AI polish request failed:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to polish text: ${error.message}`
          : 'Failed to polish text: Unknown error'
      );
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types for use in components
export type { AIPolishRequest, AIPolishResponse };