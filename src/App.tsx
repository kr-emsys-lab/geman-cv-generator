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
                  {cvData.meta.language === 'de' ? 'Einstellungen' : 'Settings'}
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleClearProviders}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {cvData.meta.language === 'de' ? 'API-Schlüssel löschen' : 'Clear API Keys'}
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
