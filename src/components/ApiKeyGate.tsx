import React, { useState } from 'react';
import { Key, Eye, EyeOff, AlertCircle, CheckCircle, Settings, Globe, FileText, UploadCloud, Sparkles, ShieldCheck } from 'lucide-react';
import { aiService } from '../services/ai-service';
import mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { AIProviders, defaultAIProviders } from '../types/ai-providers';

GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface ApiKeyGateProps {
  onProvidersSet: (providers: AIProviders) => void;
  onUploadParsed: (fileName: string, text: string) => void;
  language: 'de' | 'en';
  onLanguageToggle: () => void;
}

export function ApiKeyGate({ onProvidersSet, onUploadParsed, language, onLanguageToggle }: ApiKeyGateProps) {
  const [providers, setProviders] = useState<AIProviders>(defaultAIProviders);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'openai' | 'gemini' | 'anthropic'>('openai');
  const [selectedFlow, setSelectedFlow] = useState<'create' | 'upload' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedText, setUploadedText] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'ready' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');

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

  const parseUploadedFile = async (file: File): Promise<string> => {
    setUploadError('');
    setUploadStatus('parsing');

    try {
      const arrayBuffer = await file.arrayBuffer();
      let parsedText = '';

      if (file.name.toLowerCase().endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        parsedText = result.value.trim();
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;
        const chunks: string[] = [];

        for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
          const page = await pdf.getPage(pageIndex);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ');
          chunks.push(pageText);
        }

        parsedText = chunks.join('\n\n').trim();
      } else if (file.name.toLowerCase().endsWith('.txt')) {
        parsedText = new TextDecoder().decode(arrayBuffer).trim();
      } else {
        throw new Error('Unsupported file type');
      }

      if (!parsedText) {
        throw new Error(language === 'de' ? 'Die Datei enthält keinen erkennbaren Text.' : 'The file contains no recognizable text.');
      }

      setUploadedText(parsedText);
      setUploadStatus('ready');
      onUploadParsed(file.name, parsedText);
      return parsedText;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setUploadStatus('error');
      setUploadError(message);
      setUploadedText('');
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadedFile(file);
    setUploadError('');

    if (!file) {
      setUploadStatus('idle');
      setUploadedText('');
      return;
    }

    try {
      await parseUploadedFile(file);
    } catch {
      // error already stored in state
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

    if (selectedFlow === 'upload' && uploadStatus !== 'ready') {
      setErrors({ general: language === 'de'
        ? 'Bitte laden Sie zuerst eine gültige Lebenslauf-Datei hoch.'
        : 'Please upload a valid CV file first.'
      });
      return;
    }

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
      <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-6xl w-full">
        <button
          onClick={onLanguageToggle}
          className="absolute right-6 top-6 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20"
        >
          <Globe className="w-4 h-4" />
          {language === 'de' ? 'English' : 'Deutsch'}
        </button>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
          <div>
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 shadow-lg overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.4),_transparent_30%)]"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-blue-100 mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  {language === 'de' ? 'KI-Lebenslauf-Assistent' : 'AI CV Assistant'}
                </div>
                <h1 className="text-4xl font-bold leading-tight">
                  {language === 'de' ? 'Verbessern Sie Ihren Lebenslauf mit KI' : 'Improve your CV with AI'}
                </h1>
                <p className="mt-4 text-lg text-blue-100 max-w-xl">
                  {language === 'de'
                    ? 'Laden Sie Ihren bestehenden Lebenslauf hoch oder geben Sie Ihre Daten ein. Unsere KI hilft Ihnen, den Inhalt zu optimieren, professioneller zu formulieren und für den deutschen Arbeitsmarkt zu schärfen.'
                    : 'Upload your existing CV or enter your details manually. Our AI helps polish content, improve wording, and optimize it for the German job market.'
                  }
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setSelectedFlow('create')}
                    className={`flex items-center gap-3 rounded-2xl px-6 py-4 bg-white text-blue-900 shadow-lg transition hover:-translate-y-1 ${selectedFlow === 'create' ? 'ring-2 ring-white' : ''}`}
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>{language === 'de' ? 'Lebenslauf erstellen' : 'Create CV from scratch'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedFlow('upload')}
                    className={`flex items-center gap-3 rounded-2xl px-6 py-4 bg-white text-blue-900 shadow-lg transition hover:-translate-y-1 ${selectedFlow === 'upload' ? 'ring-2 ring-white' : ''}`}
                  >
                    <UploadCloud className="w-5 h-5 text-blue-600" />
                    <span>{language === 'de' ? 'Bestehenden Lebenslauf hochladen' : 'Upload existing CV'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="mt-4 font-semibold text-gray-900">{language === 'de' ? 'Schnelle Verbesserung' : 'Fast improvements'}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {language === 'de' ? 'AI hilft dabei, Inhalte klarer und professioneller zu formulieren.' : 'AI helps make your content clearer and more professional.'}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="mt-4 font-semibold text-gray-900">{language === 'de' ? 'DIN 5008-konform' : 'DIN 5008 compliant'}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {language === 'de' ? 'Der Lebenslauf wird für den deutschen Markt optimiert.' : 'The CV is optimized for the German job market.'}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-200">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="mt-4 font-semibold text-gray-900">{language === 'de' ? 'Sicher & lokal' : 'Secure & local'}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {language === 'de' ? 'API-Schlüssel bleiben in Ihrem Browser und werden nicht weitergegeben.' : 'API keys stay in your browser and are not shared.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  {language === 'de' ? 'Schritt 1' : 'Step 1'}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {selectedFlow
                    ? selectedFlow === 'upload'
                      ? (language === 'de' ? 'Lebenslauf hochladen' : 'Upload your CV')
                      : (language === 'de' ? 'CV-Daten eingeben' : 'Enter your CV details')
                    : (language === 'de' ? 'Wählen Sie einen Startpunkt' : 'Choose how to start')
                  }
                </h2>
              </div>
              {selectedFlow && (
                <button
                  type="button"
                  onClick={() => setSelectedFlow(null)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {language === 'de' ? 'Zurück' : 'Back'}
                </button>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {selectedFlow
                ? selectedFlow === 'upload'
                  ? (language === 'de'
                      ? 'Wählen Sie die KI-Konfiguration und laden Sie später Ihren Lebenslauf hoch.'
                      : 'Choose your AI provider configuration and upload your CV later.'
                    )
                  : (language === 'de'
                      ? 'Wählen Sie Ihren KI-Anbieter und konfigurieren Sie die API-Schlüssel, um mit der Lebenslauf-Erstellung zu beginnen.'
                      : 'Choose your AI provider and configure API keys to start building your CV.'
                    )
                : (language === 'de'
                    ? 'Sie können Ihren Lebenslauf manuell erstellen oder einen bestehenden Lebenslauf hochladen. Danach geht es zur KI-Konfiguration.'
                    : 'You can create your CV manually or upload an existing one. Then continue to AI configuration.'
                  )
              }
            </p>

            {errors.general && (
              <div className="mb-4 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200">
                <AlertCircle className="inline-block w-5 h-5 mr-2 align-text-top" />
                {errors.general}
              </div>
            )}

            {selectedFlow === 'upload' && (
              <div className="mb-6 rounded-3xl border border-dashed border-blue-200 bg-blue-50 p-5">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  {language === 'de' ? 'Lebenslauf-Datei hochladen' : 'Upload your CV file'}
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="mt-2 text-sm text-gray-600">
                  {language === 'de'
                    ? 'Akzeptierte Formate: PDF, DOCX, TXT. Die Datei wird clientseitig analysiert.'
                    : 'Accepted formats: PDF, DOCX, TXT. The file is analyzed client-side.'
                  }
                </p>

                {uploadStatus === 'parsing' && (
                  <p className="mt-4 text-sm text-blue-700">{language === 'de' ? 'Datei wird analysiert...' : 'Parsing file...'}</p>
                )}
                {uploadStatus === 'error' && uploadError && (
                  <p className="mt-4 text-sm text-red-600">{uploadError}</p>
                )}
                {uploadStatus === 'ready' && uploadedFile && (
                  <div className="mt-4 rounded-2xl bg-white p-4 border border-blue-100">
                    <p className="font-medium text-gray-900">{language === 'de' ? 'Datei bereit:' : 'File ready:'} <span className="text-blue-600">{uploadedFile.name}</span></p>
                    <p className="mt-2 text-sm text-gray-600">
                      {language === 'de' ? 'Erkannter Textvorschau:' : 'Detected text preview:'}
                    </p>
                    <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-slate-50 p-3 text-sm text-gray-700 border border-slate-200">
                      {uploadedText.slice(0, 600)}{uploadedText.length > 600 ? '...' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Provider Tabs */}
              <div className="flex mb-4 bg-white rounded-2xl p-1 shadow-sm">
                {Object.entries(providerConfigs).map(([key, config]) => {
                  const providerStatus = providers[key as keyof AIProviders].status;
                  const statusColor = {
                    connected: 'bg-green-500',
                    disconnected: 'bg-gray-300',
                    testing: 'bg-yellow-500 animate-pulse',
                    error: 'bg-red-500'
                  }[providerStatus];

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key as keyof AIProviders)}
                      className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        activeTab === key
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                        {config.name}
                      </div>
                    </button>
                  );
                })}
              </div>

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
                              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full bg-white text-gray-700 py-2 px-4 rounded-2xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6 font-medium"
              >
                {language === 'de' ? 'Konfiguration speichern' : 'Save Configuration'}
              </button>
            </form>

            <div className="mt-6 text-sm text-gray-600">
              {language === 'de' 
                ? 'Ihre API-Schlüssel werden nur lokal in Ihrem Browser gespeichert und niemals an Server gesendet.'
                : 'Your API keys are stored locally in your browser only and are never sent to servers.'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
