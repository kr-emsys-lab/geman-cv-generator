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

## GitHub Actions compatibility

- The workflow now forces JavaScript actions to Node.js 24:
  - `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`
- Node.js 20 is deprecated for GitHub Actions.
- Use Node.js 24 in `actions/setup-node@v4`.
