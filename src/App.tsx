import React, { useState, useEffect } from 'react';
import { ApiKeyGate } from './components/ApiKeyGate';
import { CVPreview } from './components/CVPreview';
import { DesignToggle } from './components/DesignToggle';
import { CVForm } from './components/CVForm';
import { CVData, defaultCVData } from './types/cv-data';
import { useLocalStorage } from './hooks/useLocalStorage';
import { aiService } from './services/ai-service';
import { AIProviders, defaultAIProviders } from './types/ai-providers';
import { Settings, Download, Globe, ArrowLeft, Upload, FileText } from 'lucide-react';

function App() {
  const [aiProviders, setAiProviders] = useLocalStorage<AIProviders>('cv_ai_providers', defaultAIProviders);
  const [cvData, setCvData] = useLocalStorage<CVData>('cv_data', defaultCVData);
  const [language, setLanguage] = useLocalStorage<'de' | 'en'>('cv_app_language', cvData.meta.language);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useLocalStorage<'create' | 'upload'>('cv_mode', 'create');

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

  const handleUploadParsed = (fileName: string, text: string) => {
    // Parse the uploaded CV text and populate form fields
    const parsedData = parseUploadedCV(text);
    updateCvData({
      ...parsedData,
      upload: {
        fileName,
        text,
        parsedAt: new Date().toISOString()
      }
    });
  };

  const parseUploadedCV = (text: string): Partial<CVData> => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const parsed: Partial<CVData> = {};

    // Simple parsing logic - this could be enhanced with AI later
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Personal information
      if (!parsed.personal) parsed.personal = { ...cvData.personal };

      // Name detection (usually first line or prominent)
      if (i < 3 && line.split(' ').length >= 2 && !line.includes('@') && !line.includes('straße') && !line.includes('str.')) {
        const nameParts = lines[i].split(' ');
        if (nameParts.length >= 2) {
          parsed.personal.firstName = nameParts[0];
          parsed.personal.lastName = nameParts.slice(1).join(' ');
        }
      }

      // Email
      if (line.includes('@') && line.includes('.')) {
        const emailMatch = lines[i].match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          parsed.personal.email = emailMatch[0];
        }
      }

      // Phone
      const phoneMatch = lines[i].match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch && !parsed.personal.phone) {
        parsed.personal.phone = phoneMatch[0];
      }

      // Address
      if (line.includes('straße') || line.includes('str.') || line.includes('weg') || line.includes('platz')) {
        parsed.personal.street = lines[i];
      }

      // Postal code and city
      const postalMatch = lines[i].match(/(\d{5})\s+([A-Za-zäöüÄÖÜß\s]+)/);
      if (postalMatch) {
        parsed.personal.postalCode = postalMatch[1];
        parsed.personal.city = postalMatch[2].trim();
      }
    }

    return parsed;
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
    const nextLanguage = language === 'de' ? 'en' : 'de';
    setLanguage(nextLanguage);
    updateCvData({
      meta: {
        ...cvData.meta,
        language: nextLanguage
      }
    });
  };

  useEffect(() => {
    setCvData(prev => {
      if (prev.meta.language === language) return prev;
      return {
        ...prev,
        meta: {
          ...prev.meta,
          language
        }
      };
    });
  }, [language, setCvData]);

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
    return <ApiKeyGate
      onProvidersSet={handleProvidersSet}
      onUploadParsed={handleUploadParsed}
      language={language}
      onLanguageToggle={toggleLanguage}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // Navigate back to landing page
                handleClearProviders();
                setMode('create');
                setCvData(defaultCVData);
                window.location.reload(); // Force reload to show ApiKeyGate
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {cvData.meta.language === 'de' ? 'Zurück' : 'Back'}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">German CV Generator</h1>
              <p className="text-sm text-gray-600">
                {cvData.meta.language === 'de' 
                  ? 'Professioneller Lebenslauf nach DIN 5008' 
                  : 'Professional CV according to DIN 5008'
                }
              </p>
            </div>
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

            {/* Create/Upload Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                {cvData.meta.language === 'de' ? 'Modus:' : 'Mode:'}
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setMode('create')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'create'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {cvData.meta.language === 'de' ? 'Erstellen' : 'Create'}
                </button>
                <button
                  onClick={() => setMode('upload')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'upload'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  {cvData.meta.language === 'de' ? 'Hochladen' : 'Upload'}
                </button>
              </div>
            </div>
            
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
            
            {/* CV Form */}
            <CVForm
              cvData={cvData}
              onUpdate={updateCvData}
              language={cvData.meta.language}
            />

            {/* Upload Content Display */}
            {cvData.upload && mode === 'upload' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  {cvData.meta.language === 'de' ? 'Hochgeladener CV' : 'Uploaded CV'}
                </h3>
                <div className="text-xs text-gray-600 mb-2">
                  {cvData.upload.fileName} ({new Date(cvData.upload.parsedAt).toLocaleString()})
                </div>
                <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                    {cvData.upload.text}
                  </pre>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  {cvData.meta.language === 'de' 
                    ? 'Die geparsten Daten wurden automatisch in die Formularfelder übertragen.'
                    : 'Parsed data has been automatically transferred to the form fields.'
                  }
                </div>
              </div>
            )}
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
