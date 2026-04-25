import React, { useState, useEffect } from 'react';
import { ApiKeyGate } from './components/ApiKeyGate';
import { CVPreview } from './components/CVPreview';
import { DesignToggle } from './components/DesignToggle';
import { CVData, defaultCVData } from './types/cv-data';
import { useLocalStorage } from './hooks/useLocalStorage';
import { aiService } from './services/ai-service';
import { AIProviders, defaultAIProviders } from './types/ai-providers';
import { Settings, Download, Globe } from 'lucide-react';

function App() {
  const [aiProviders, setAiProviders] = useLocalStorage<AIProviders>('cv_ai_providers', defaultAIProviders);
  const [cvData, setCvData] = useLocalStorage<CVData>('cv_data', defaultCVData);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize AI service with stored providers
  useEffect(() => {
    if (aiProviders) {
      aiService.setProviders(aiProviders);
    }
  }, [aiProviders]);

  const handleProvidersSet = (providers: AIProviders) => {
    setAiProviders(providers);
    aiService.setProviders(providers);
  };

  const handleClearProviders = () => {
    const clearedProviders = { ...defaultAIProviders };
    setAiProviders(clearedProviders);
    aiService.clearProviders();
  };

  const updateCvData = (updates: Partial<CVData>) => {
    setCvData(prev => ({ ...prev, ...updates }));
  };

  const toggleLanguage = () => {
    updateCvData({
      meta: {
        ...cvData.meta,
        language: cvData.meta.language === 'de' ? 'en' : 'de'
      }
    });
  };

  const handleFormatChange = (format: 'classic' | 'ats') => {
    updateCvData({
      meta: {
        ...cvData.meta,
        designFormat: format
      }
    });
  };

  // Show API key gate if no providers are configured
  if (!aiService.isConfigured()) {
    return <ApiKeyGate onProvidersSet={handleProvidersSet} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">German CV Generator</h1>
            <p className="text-sm text-gray-600">
              {cvData.meta.language === 'de' 
                ? 'Professioneller Lebenslauf nach DIN 5008' 
                : 'Professional CV according to DIN 5008'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Active Provider Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                {cvData.meta.language === 'de' ? 'AI-Anbieter:' : 'AI Provider:'}
              </label>
              <select
                value={aiProviders.activeProvider}
                onChange={(e) => {
                  const newProviders = { ...aiProviders, activeProvider: e.target.value as keyof typeof aiProviders };
                  setAiProviders(newProviders);
                  aiService.setProviders(newProviders);
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(aiProviders).map(([key, config]) => {
                  if (key === 'activeProvider') return null;
                  const statusColor = {
                    connected: 'bg-green-500',
                    disconnected: 'bg-gray-400',
                    testing: 'bg-yellow-500',
                    error: 'bg-red-500'
                  }[config.status];
                  
                  return (
                    <option key={key} value={key} disabled={!config.enabled}>
                      {key === 'openai' ? 'OpenAI' : 
                       key === 'gemini' ? 'Google Gemini' : 
                       'Anthropic'} {config.enabled ? '✓' : '✗'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {cvData.meta.language === 'de' ? 'Deutsch' : 'English'}
            </button>
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {cvData.meta.language === 'de' ? 'Einstellungen' : 'Settings'}
            </button>
            
            {/* Download Button */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              {cvData.meta.language === 'de' ? 'PDF herunterladen' : 'Download PDF'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Design Format Toggle */}
            <DesignToggle
              currentFormat={cvData.meta.designFormat}
              onFormatChange={handleFormatChange}
              language={cvData.meta.language}
            />
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  {cvData.meta.language === 'de' ? 'AI-Anbieter' : 'AI Providers'}
                </h3>
                
                <div className="space-y-3 mb-4">
                  {Object.entries(aiProviders).map(([key, config]) => {
                    if (key === 'activeProvider') return null;
                    
                    const statusColor = {
                      connected: 'bg-green-500',
                      disconnected: 'bg-gray-400',
                      testing: 'bg-yellow-500',
                      error: 'bg-red-500'
                    }[config.status];
                    
                    const statusText = {
                      connected: cvData.meta.language === 'de' ? 'Verbunden' : 'Connected',
                      disconnected: cvData.meta.language === 'de' ? 'Nicht verbunden' : 'Disconnected',
                      testing: cvData.meta.language === 'de' ? 'Teste...' : 'Testing...',
                      error: cvData.meta.language === 'de' ? 'Fehler' : 'Error'
                    }[config.status];
                    
                    const providerName = {
                      openai: 'OpenAI',
                      gemini: 'Google Gemini',
                      anthropic: 'Anthropic'
                    }[key as keyof typeof aiProviders];
                    
                    const modelOptions = {
                      openai: [
                        { value: 'gpt-4o', label: 'GPT-4o' },
                        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
                      ],
                      gemini: [
                        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
                        { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' }
                      ],
                      anthropic: [
                        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
                        { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' }
                      ]
                    }[key as keyof typeof aiProviders];
                    
                    return (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                            <span className="text-sm font-medium">{providerName}</span>
                          </div>
                          <span className="text-xs text-gray-600">{statusText}</span>
                        </div>
                        {config.enabled && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              {cvData.meta.language === 'de' ? 'Modell' : 'Model'}
                            </label>
                            <select
                              value={config.model}
                              onChange={(e) => {
                                const newProviders = { ...aiProviders };
                                (newProviders[key as keyof typeof aiProviders] as any).model = e.target.value;
                                setAiProviders(newProviders);
                                aiService.setProviders(newProviders);
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              {modelOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleClearProviders}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {cvData.meta.language === 'de' ? 'Alle API-Schlüssel löschen' : 'Clear All API Keys'}
                  </button>
                  
                  <button
                    onClick={() => {
                      // Navigate back to provider setup
                      handleClearProviders();
                      window.location.reload(); // Force reload to show ApiKeyGate
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {cvData.meta.language === 'de' ? 'API-Schlüssel verwalten' : 'Manage API Keys'}
                  </button>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {cvData.meta.language === 'de' 
                        ? 'Alle Daten werden lokal gespeichert'
                        : 'All data is stored locally'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form sections will go here */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {cvData.meta.language === 'de' ? 'CV-Bereiche' : 'CV Sections'}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• {cvData.meta.language === 'de' ? 'Persönliche Daten' : 'Personal Information'}</div>
                <div>• {cvData.meta.language === 'de' ? 'Berufserfahrung' : 'Work Experience'}</div>
                <div>• {cvData.meta.language === 'de' ? 'Ausbildung' : 'Education'}</div>
                <div>• {cvData.meta.language === 'de' ? 'Kenntnisse' : 'Skills'}</div>
                <div>• {cvData.meta.language === 'de' ? 'Projekte' : 'Projects'}</div>
                <div>• {cvData.meta.language === 'de' ? 'Zertifikate' : 'Certificates'}</div>
                <div>• {cvData.meta.language === 'de' ? 'Hobbys' : 'Hobbies'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - PDF Preview */}
        <div className="flex-1 bg-gray-100">
          <CVPreview cvData={cvData} />
        </div>
      </div>
    </div>
  );
}

export default App;
