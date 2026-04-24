# German CV Generator — Technical Specification

## 1. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | React 18 + TypeScript | Component model suits form-heavy input UIs |
| Build Tool | Vite | Fast HMR, native ESM, minimal config |
| Styling | Tailwind CSS v3 | Utility-first, no runtime overhead |
| PDF Engine | `@react-pdf/renderer` | Renders a React component tree directly to PDF in-browser; no server needed |
| Icons | `lucide-react` | Already in the project |
| AI | Multi-BYOK (OpenAI, Google Gemini, Anthropic) | User supplies own keys; unified via Vercel AI SDK |

### Package additions required
```
@react-pdf/renderer   # PDF generation
ai                    # Vercel AI SDK core
@ai-sdk/openai       # OpenAI provider
@ai-sdk/google       # Google Gemini provider
@ai-sdk/anthropic    # Anthropic Claude provider
```

---

## 2. State Management

All persistent state is stored in **`localStorage`** only — no database, no backend session. The app is entirely client-side.

### 2.1 Storage Keys

| Key | Type | Contents |
|---|---|---|
| `cv_ai_providers` | `JSON string` | Multi-provider configuration object (see §2.4) |
| `cv_data` | `JSON string` | Full `CVData` object (see §4) |

### 2.2 In-memory State (React)

The top-level `App` component holds two pieces of React state:

```ts
const [aiProviders, setAiProviders] = useState<AIProviders>(() => {
  const raw = localStorage.getItem('cv_ai_providers');
  return raw ? JSON.parse(raw) : defaultAIProviders;
});
const [cvData, setCvData] = useState<CVData>(() => {
  const raw = localStorage.getItem('cv_data');
  return raw ? JSON.parse(raw) : defaultCVData;
});
```

Any write to `cvData` or `aiProviders` is immediately mirrored to `localStorage` via a `useEffect`.

### 2.3 AI Providers Data Structure

```ts
interface AIProviders {
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

const defaultAIProviders: AIProviders = {
  openai: { apiKey: '', model: 'gpt-4o', enabled: false },
  gemini: { apiKey: '', model: 'gemini-1.5-pro', enabled: false },
  anthropic: { apiKey: '', model: 'claude-3-5-sonnet-20241022', enabled: false },
  activeProvider: 'openai'
};
```

### 2.4 Data Flow

```
User edits form
     │
     ▼
setCvData(newData)          ← optimistic, instant
     │
     ▼
useEffect → localStorage.setItem('cv_data', JSON.stringify(newData))
            localStorage.setItem('cv_ai_providers', JSON.stringify(aiProviders))
     │
     ▼
<PDFViewer> re-renders live preview
```

There is **no server round-trip** for saving. The PDF export is also fully client-side.

---

## 3. Multi-BYOK (Bring Your Own Keys) Architecture

The app never stores or proxies API keys through any server. All keys live only in the user's browser and are used directly with their respective AI providers.

### 3.1 Key Entry Flow

1. On first load, if no AI provider is configured, the app renders a **full-screen AI Provider Setup** component.
2. The user can configure multiple providers:
   - **OpenAI**: `sk-proj-...` or `sk-...` key format
   - **Google Gemini**: `AI...` key format  
   - **Anthropic**: `sk-ant-...` key format
3. Each provider has a "Test Connection" button that validates the key with a simple API call.
4. The user selects an active provider from a dropdown.
5. At any time the user can manage providers from the Settings panel.

### 3.2 Unified AI Service

The AI service uses the Vercel AI SDK to provide a unified interface across all providers:

```
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';

const getProvider = (activeProvider: string, config: AIProviders) => {
  switch (activeProvider) {
    case 'openai':
      return openai(config.openai.model, { apiKey: config.openai.apiKey });
    case 'gemini':
      return google(config.gemini.model, { apiKey: config.gemini.apiKey });
    case 'anthropic':
      return anthropic(config.anthropic.model, { apiKey: config.anthropic.apiKey });
  }
};

const result = await generateText({
  model: getProvider(activeProvider, aiProviders),
  system: systemPrompt,
  prompt: userPrompt,
  temperature: 0
});
```

**What the AI feature does:** Given the current CV section text, Claude rewrites it to be more professional, concise, and appropriate for the German market (formal tone, action verbs, quantified achievements).

### 3.3 Security Considerations

- All keys are stored in `localStorage`, not `sessionStorage` or cookies, for persistence across sessions. Users are warned that anyone with physical access to their browser can read them.
- No key material is ever sent to domains other than the respective AI provider APIs.
- The app includes "Clear All Keys" and individual provider clear buttons in the settings view.
- Each provider uses their recommended latest models by default.

### 3.4 Provider-Specific Configuration

| Provider | Key Format | Default Model | API Endpoint |
|---|---|---|---|
| OpenAI | `sk-proj-...` or `sk-...` | `gpt-4o` | `api.openai.com` |
| Google Gemini | `AI...` | `gemini-1.5-pro` | `generativelanguage.googleapis.com` |
| Anthropic | `sk-ant-...` | `claude-3-5-sonnet-20241022` | `api.anthropic.com` |

### 3.5 Multi-Provider AI Requirements

#### Overview
The application must support multiple AI providers (OpenAI, Google Gemini, Anthropic) to give users flexibility in choosing their preferred AI service. All providers use Bring-Your-Own-Key (BYOK) model - users supply their own API keys.

#### Technical Constraints
- **Token Efficiency**: All AI operations must minimize token usage. Implement prompt optimization, caching, and incremental processing to stay within reasonable limits.
- **Unified Interface**: Use Vercel AI SDK for consistent API across providers.
- **Fallback Handling**: Graceful degradation if a provider fails or quota is exceeded.
- **Cost Awareness**: Display estimated token costs and allow users to select cost-effective models.

#### Provider Configuration
- Each provider has independent API key, model selection, and enable/disable toggle.
- Active provider selection for current session.
- Secure key storage in localStorage with optional encryption.

#### AI Features
- CV text polishing and optimization
- ATS-friendly formatting suggestions
- German language support with DIN 5008 compliance
- Contextual improvements based on job descriptions

---

## 4. DIN 5008 Layout Requirements

DIN 5008 is the German standard (Deutsche Industrie-Norm) for business correspondence and documents. The following rules apply to the generated PDF.

### 4.1 Page Format

| Property | Value |
|---|---|
| Page size | A4 (210 mm × 297 mm) |
| Top margin | 27 mm (for letterhead / address window area) |
| Bottom margin | 20 mm |
| Left margin | 25 mm |
| Right margin | 20 mm |
| Font | Arial or a clean sans-serif substitute (Open Sans via `@react-pdf/renderer` Font API) |
| Base font size | 11 pt body, 14 pt section headings, 18 pt name |
| Line spacing | 1.2–1.5 (approx. 150% for body) |

### 4.2 Document Structure (in order)

1. **Header / Personal Block** — Name (large), address, phone, email, LinkedIn/Xing (optional), date of birth, nationality, photo (right-aligned, 4 × 5 cm, optional but conventional in DE)
2. **Subject Line** — "Lebenslauf" or "Curriculum Vitae" centered or left-aligned, bold
3. **Berufserfahrung** (Work Experience) — reverse chronological; each entry: dates left-column | role + employer + city in right column; bullet points for responsibilities
4. **Ausbildung** (Education) — same two-column format
5. **Kenntnisse** (Skills) — subdivided into Sprachen (Languages), IT-Kenntnisse (IT), Sonstige (Other)
6. **Projekte / Zertifikate** (optional)
7. **Hobbys / Interessen** (optional; common in DE)
8. **Ort, Datum und Unterschrift** — city + date line + signature placeholder at the bottom

### 4.3 Two-Column Date/Content Layout

Standard DIN 5008 CV entries use a fixed left column for dates:

```
[MM/YYYY – MM/YYYY]   [Job Title]
                       [Employer, City]
                       • Achievement one
                       • Achievement two
```

Left column width: ~30% of content area. Right column: ~70%.

### 4.4 Conventions for the German Market

- **Photo** is expected and should appear in the top-right of the header block (4 × 5 cm). The field is optional but defaults to a placeholder.
- **Date format**: `MM/YYYY` for ranges, `DD.MM.YYYY` for full dates (birth date, document date).
- **Address format**: Street + number on one line, postcode + city on the next (German postal order).
- **Language of document**: German by default; the app supports toggling to English.
- **Marital status / nationality**: Included in the personal data block per German convention (user may omit).
- **Signature line**: A physical space at the bottom for a handwritten or digital signature is standard.
- **No page numbers** on a single-page CV; page numbers optional for multi-page.
- **Hyperlinks** (email, LinkedIn) should render as plain underlined text in the PDF, not blue auto-styled anchors.

---

## 5. Component Architecture

```
App
├── AIProviderSetup         ← shown when no providers are configured
├── Layout
│   ├── Sidebar
│   │   ├── SectionNav     ← jump to Personal / Experience / Education / Skills
│   │   └── SettingsPanel  ← manage providers, language toggle, photo upload
│   │       ├── ProviderSelector    ← dropdown to choose active provider
│   │       ├── ProviderConfig      ← API key inputs with test buttons
│   │       └── ProviderStatus      ← connection status indicators
│   └── MainArea
│       ├── EditorPanel    ← all form sections
│       │   ├── PersonalInfoForm
│       │   ├── ExperienceForm  (dynamic list)
│       │   ├── EducationForm   (dynamic list)
│       │   ├── SkillsForm
│       │   └── AiPolishButton  ← calls active AI provider
│       └── PreviewPanel
│           └── PDFViewer  ← live @react-pdf/renderer preview
└── ExportButton            ← triggers pdf download
```

### 5.1 New Components for Multi-BYOK

```
AIProviderSetup
├── ProviderCard (OpenAI)
│   ├── KeyInput
│   ├── ModelSelector
│   └── TestConnectionButton
├── ProviderCard (Gemini)
│   ├── KeyInput
│   ├── ModelSelector
│   └── TestConnectionButton
├── ProviderCard (Anthropic)
│   ├── KeyInput
│   ├── ModelSelector
│   └── TestConnectionButton
└── ActiveProviderSelector
```

---

## 6. CVData Type Definition

```ts
interface CVData {
  personal: {
    firstName: string;
    lastName: string;
    title: string;           // e.g. "Dr." or "Prof."
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    phone: string;
    email: string;
    linkedin: string;
    xing: string;
    dateOfBirth: string;     // DD.MM.YYYY
    placeOfBirth: string;
    nationality: string;
    maritalStatus: string;
    photoDataUrl: string;    // base64 image or empty string
  };
  experience: WorkEntry[];
  education: EducationEntry[];
  skills: {
    languages: SkillItem[];
    it: SkillItem[];
    other: SkillItem[];
  };
  projects: ProjectEntry[];
  certificates: CertificateEntry[];
  hobbies: string;
  meta: {
    language: 'de' | 'en';
    designFormat: 'classic' | 'ats';
    signatureCity: string;
    signatureDate: string;   // DD.MM.YYYY
  };
}

interface WorkEntry {
  id: string;
  startDate: string;         // MM/YYYY
  endDate: string;           // MM/YYYY or "heute"
  role: string;
  employer: string;
  city: string;
  bullets: string[];
}

interface EducationEntry {
  id: string;
  startDate: string;
  endDate: string;
  degree: string;
  institution: string;
  city: string;
  grade: string;
  bullets: string[];
}

interface SkillItem {
  id: string;
  name: string;
  level: string;             // e.g. "Muttersprache", "B2", "Grundkenntnisse"
}

interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface CertificateEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
}
```

---

## 7. AI Polish Feature

When the user clicks "Mit KI verbessern" (Improve with AI) on any text field or section:

1. The current field text and its context (section name, job title) are sent to the active AI provider.
2. System prompt instructs the AI to:
   - Rewrite in professional German (or English if toggled)
   - Use strong action verbs (*entwickelte*, *leitete*, *optimierte*)
   - Add quantification hints where missing
   - Keep the original meaning and facts unchanged
   - Return only the rewritten text, no commentary
3. The response is generated and replaces the field value on completion.
4. The user can undo with a "Zurücksetzen" (Reset) button that re-inserts the pre-AI text.

**Default Models:**
- OpenAI: `gpt-4o`
- Google Gemini: `gemini-1.5-pro`  
- Anthropic: `claude-3-5-sonnet-20241022`

**Generation Parameters:**
- Max tokens: `1024`
- Temperature: `0` (deterministic, professional output)

### 7.1 Provider-Specific System Prompts

Each provider receives the same core German HR expert prompt but with provider-specific formatting optimizations:

- **OpenAI**: Optimized for GPT-4's structured reasoning capabilities
- **Gemini**: Leverages Google's multilingual strengths for German business language
- **Anthropic**: Uses Claude's detailed instruction-following for precise DIN 5008 compliance

---

## 8. Settings UI Specifications

### 8.1 Provider Management Interface

```
Settings Panel
├── Active Provider Dropdown
│   ├── OpenAI GPT-4o [●] ← green dot if configured
│   ├── Google Gemini [○] ← gray dot if not configured  
│   └── Anthropic Claude [●]
├── Provider Configuration Cards
│   ├── OpenAI Card
│   │   ├── API Key Input (password field)
│   │   ├── Model Selector (gpt-4o, gpt-4o-mini)
│   │   ├── Test Connection Button
│   │   └── Status Indicator (✓ Connected / ✗ Error / ○ Not tested)
│   ├── Gemini Card (same structure)
│   └── Anthropic Card (same structure)
└── Bulk Actions
    ├── Clear All Keys
    └── Export/Import Settings
```

### 8.2 Connection Testing

Each "Test Connection" button sends a minimal test prompt to validate:
1. API key validity
2. Model accessibility  
3. Response format compatibility
4. Rate limiting status

Success shows ✓ with response time. Failure shows specific error message (invalid key, quota exceeded, model unavailable, etc.).