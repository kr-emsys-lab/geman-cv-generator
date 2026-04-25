import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, AlertCircle, CheckCircle, Settings, Globe } from 'lucide-react';
import { aiService } from '../services/ai-service';
import { AIProviders, defaultAIProviders } from '../types/ai-providers';

interface ApiKeyGateProps {
  onProvidersSet: (providers: AIProviders) => void;
}

export function ApiKeyGate({ onProvidersSet }: ApiKeyGateProps) {
  const [providers, setProviders] = useState<AIProviders>(defaultAIProviders);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'openai' | 'gemini' | 'anthropic'>('openai');
  const [language, setLanguage] = useState<'de' | 'en'>('de');

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('cv_app_language');
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage
  const toggleLanguage = () => {
    const newLanguage = language === 'de' ? 'en' : 'de';
    setLanguage(newLanguage);
    localStorage.setItem('cv_app_language', newLanguage);
  };

  const providerConfigs = {
    openai: {
      name: language === 'de' ? 'OpenAI' : 'OpenAI',
      keyFormat: language === 'de' ? 'sk-proj-... oder sk-...' : 'sk-proj-... or sk-...',
      models: ['gpt-4o', 'gpt-4o-mini'] as const
    },
    gemini: {
      name: language === 'de' ? 'Google Gemini' : 'Google Gemini',
      keyFormat: 'AI...',
      models: ['gemini-1.5-pro', 'gemini-2.0-flash-exp'] as const
    },
    anthropic: {
      name: language === 'de' ? 'Anthropic' : 'Anthropic',
      keyFormat: language === 'de' ? 'sk-ant-...' : 'sk-ant-...',
      models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'] as const
    }
  };

  const validateApiKey = (provider: keyof AIProviders, key: string): boolean => {
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-proj-') || key.startsWith('sk-');
      case 'gemini':
        return key.startsWith('AI');
      case 'anthropic':
        return key.startsWith('sk-ant-');
      default:
        return false;
    }
  };

  const handleProviderChange = (provider: keyof AIProviders, field: string, value: string | boolean) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (field === 'apiKey' && errors[provider]) {
      setErrors(prev => ({ ...prev, [provider]: '' }));
    }
  };

  const testProvider = async (provider: keyof AIProviders) => {
    const config = providers[provider];
    if (!config.apiKey || !config.enabled) return;

    console.log(`Testing provider: ${provider}`, {
      apiKey: config.apiKey.substring(0, 10) + '...',
      model: config.model,
      enabled: config.enabled
    });

    // Update status to testing
    handleProviderChange(provider, 'status', 'testing');
    setIsValidating(true);

    try {
      // Temporarily set this provider as active for testing
      const testProviders = { ...providers, activeProvider: provider };
      aiService.setProviders(testProviders);

      console.log('Making test API call...');
      await aiService.polishText({
        text: 'Test',
        context: {
          section: 'experience',
          language: 'de'
        },
        mode: 'standard'
      });

      console.log('Test API call successful!');
      handleProviderChange(provider, 'status', 'connected');
      setErrors(prev => ({ ...prev, [provider]: '' }));
    } catch (error) {
      console.error(`Test failed for provider ${provider}:`, error);
      handleProviderChange(provider, 'status', 'error');
      setErrors(prev => ({
        ...prev,
        [provider]: language === 'de' 
          ? 'API-Schlüssel konnte nicht validiert werden. Bitte überprüfen Sie ihn.'
          : 'API key could not be validated. Please check it.'
      }));
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if at least one provider is enabled and configured
    const hasValidProvider = Object.entries(providers).some(([key, config]) => {
      if (key === 'activeProvider') return false;
      return config.enabled && config.apiKey && validateApiKey(key as keyof AIProviders, config.apiKey);
    });

    if (!hasValidProvider) {
      setErrors({ general: language === 'de' 
        ? 'Bitte konfigurieren Sie mindestens einen AI-Anbieter.' 
        : 'Please configure at least one AI provider.' 
      });
      return;
    }

    // Set the first enabled provider as active if current active is not enabled
    const activeConfig = providers[providers.activeProvider];
    if (!activeConfig.enabled || !activeConfig.apiKey) {
      const firstEnabled = Object.entries(providers).find(([key, config]) =>
        key !== 'activeProvider' && config.enabled && config.apiKey
      );
      if (firstEnabled) {
        providers.activeProvider = firstEnabled[0] as keyof AIProviders;
      }
    }

    aiService.setProviders(providers);
    onProvidersSet(providers);
  };

  const enabledProviders = Object.entries(providers).filter(([key, config]) =>
    key !== 'activeProvider' && config.enabled
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8 relative">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="absolute top-0 right-0 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Globe className="w-4 h-4" />
            {language === 'de' ? 'English' : 'Deutsch'}
          </button>
          
          <Settings className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'de' ? 'AI-Anbieter konfigurieren' : 'Configure AI Providers'}
          </h1>
          <p className="text-gray-600 mt-2">
            {language === 'de' 
              ? 'Wählen Sie mindestens einen AI-Anbieter aus und geben Sie Ihren API-Schlüssel ein.'
              : 'Select at least one AI provider and enter your API key.'
            }
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Provider Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            {Object.entries(providerConfigs).map(([key, config]) => {
              const providerStatus = providers[key as keyof AIProviders].status;
              const statusColor = {
                connected: 'bg-green-500',
                disconnected: 'bg-gray-400',
                testing: 'bg-yellow-500 animate-pulse',
                error: 'bg-red-500'
              }[providerStatus];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as keyof AIProviders)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                  {config.name}
                </button>
              );
            })}
          </div>

          {/* Provider Configuration */}
          {Object.entries(providerConfigs).map(([key, config]) => (
            <div key={key} className={activeTab === key ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${key}-enabled`}
                    checked={providers[key as keyof AIProviders].enabled}
                    onChange={(e) => handleProviderChange(key as keyof AIProviders, 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${key}-enabled`} className="ml-2 text-sm font-medium text-gray-900">
                    {config.name} {language === 'de' ? 'aktivieren' : 'enable'}
                  </label>
                </div>

                {providers[key as keyof AIProviders].enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'de' ? 'API-Schlüssel' : 'API Key'} ({config.keyFormat})
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys[key] ? 'text' : 'password'}
                          value={providers[key as keyof AIProviders].apiKey}
                          onChange={(e) => handleProviderChange(key as keyof AIProviders, 'apiKey', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                            errors[key] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder={`${language === 'de' ? 'Ihr' : 'Your'} ${config.name} ${language === 'de' ? 'API-Schlüssel' : 'API Key'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showKeys[key] ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors[key] && (
                        <p className="mt-1 text-sm text-red-600">{errors[key]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'de' ? 'Modell' : 'Model'}
                      </label>
                      <select
                        value={providers[key as keyof AIProviders].model}
                        onChange={(e) => handleProviderChange(key as keyof AIProviders, 'model', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {config.models.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => testProvider(key as keyof AIProviders)}
                      disabled={!providers[key as keyof AIProviders].apiKey || isValidating}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isValidating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {language === 'de' ? 'Verbindung testen' : 'Test Connection'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={enabledProviders.length === 0 || isValidating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6 font-medium"
          >
            {language === 'de' ? 'Konfiguration speichern' : 'Save Configuration'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {language === 'de' 
            ? 'Ihre API-Schlüssel werden nur lokal in Ihrem Browser gespeichert und niemals an Server gesendet.'
            : 'Your API keys are stored locally in your browser only and are never sent to servers.'
          }
        </div>
      </div>
    </div>
  );
}
