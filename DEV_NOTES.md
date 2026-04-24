# DEV_NOTES

## Local verification before feature work

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Run the app locally:
   ```bash
   npm run dev
   ```
   Then open `http://localhost:5173`.

3. Build for production:
   ```bash
   npm run build
   ```

4. Verify the build output:
   - `dist/index.html` exists
   - `dist/assets/` contains JS/CSS bundles
   - `vite.config.ts` must use the correct `base` path for GitHub Pages, e.g. `/german-cv-generator/`

5. Preview the production build locally:
   ```bash
   npm run preview
   ```
   or serve the build directory manually:
   ```bash
   npx serve dist
   ```

6. Deployment note:
   - Use the `gh-pages` action on `main` branch
   - Confirm GitHub Pages source is set to `gh-pages` branch if using the action's default publish branch
   - If GitHub Pages is still empty, inspect `dist/index.html` and the workflow run logs

## API Key Testing

### Method 1: Browser Console Test
1. Start the dev server: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Open browser developer tools (F12) → Console tab
4. Copy and paste the contents of `test-api-keys.js` into the console
5. Test your API keys:
   ```javascript
   testAPIKey('openai', 'your-openai-key-here', 'gpt-4o-mini')
   testAPIKey('anthropic', 'your-anthropic-key-here', 'claude-3-5-haiku-20241022')
   testAPIKey('gemini', 'your-gemini-key-here', 'gemini-1.5-flash')
   ```

### Method 2: Node.js Test Script
Test API keys using the same AI SDK as the app:
```bash
node test-api-keys-node.js openai sk-your-key-here gpt-4o-mini
node test-api-keys-node.js anthropic sk-ant-your-key-here claude-3-5-haiku-20241022
node test-api-keys-node.js gemini AI-your-key-here gemini-1.5-pro
```

**Note:** Anthropic and Gemini providers use environment variables internally. OpenAI uses parameter passing.

### Method 3: Browser Console (Limited)
- **Works for:** Gemini (supports CORS)
- **Doesn't work for:** OpenAI, Anthropic (CORS blocked)
- Use Node.js testing for OpenAI and Anthropic

### Method 3: In-App Testing
1. Start the dev server: `npm run dev`
2. Navigate to the API key configuration page
3. Enter your API keys and click "Verbindung testen" (Test Connection)
4. Check browser console for detailed error logs

### Common Issues
- **401 Unauthorized**: API key is invalid or expired
- **403 Forbidden**: API key lacks required permissions
- **429 Too Many Requests**: Rate limit exceeded
- **Network errors**: Check internet connection or firewall settings
