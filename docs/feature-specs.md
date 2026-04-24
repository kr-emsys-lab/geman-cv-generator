# Feature Specs

## Multi-Provider AI
- Support OpenAI, Google Gemini, Anthropic
- Store keys per provider in `localStorage`
- Allow active provider selection
- Show status indicator for active provider (green/red)
- Provide a privacy reset button to clear all stored keys
- Minimize token usage with prompt optimization and caching

## User CV Upload
- Accept `.pdf` and `.docx` files
- Parse content client-side
- Extract CV sections and plain text
- Use AI to suggest improvements without reprocessing the full document
- Display suggestions in the editor with minimal token consumption

## Token-Constrained AI Flow
- Only send the relevant section or diff to the AI
- Avoid full CV re-generation on every change
- Keep prompts concise and reusable
- Show estimated token usage when possible
