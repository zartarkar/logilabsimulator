# Plan - Persistent Query Parameters & State Sync

Ensure the URL query parameters remain persistent across tab switches and accurately reflect the current simulation state (expression and input values).

## User Review Required

> [!IMPORTANT]
> The query parameter format will be updated to include `tab` and `v` (input values) in addition to `q` (expression), e.g., `?q=ABC&tab=build&v=A1,B0,C1`.

- Do you prefer a specific character to separate input values in the URL (currently using commas and pairs like `A1`)?

## Proposed Changes

### Logic & Store
- Update `src/store/useCircuitStore.ts` to include `tab` in the state.
- Add logic to serialize and deserialize the current input values (`values` map) into a string format suitable for URLs.

### Navigation & Routing
- In `src/routes/index.tsx`:
    - Update `searchSchema` to include `tab` and `v` (values).
    - Refactor `useEffect` hooks that sync state with query parameters to include the new parameters.
    - Ensure `navigate` calls preserve all relevant parameters when any piece of state changes.
    - Update the tab switching logic to trigger a navigation update.

### Component Integration
- Modify `InputsPanel.tsx` and `SandboxBuilder.tsx` to ensure input toggles trigger a URL update (via the store's `setValue` which will now be watched by the router sync effect).

## Technical Details
- URL format: `?q=<expression>&tab=<circuit|build|learn>&v=<var1><val1>,<var2><val2>...`
- Use TanStack Router's `navigate` with `replace: true` for state-only updates to avoid polluting history.
- Ensure the `useEffect` in `index.tsx` handles initial load from URL correctly, overriding local storage if URL params are present.
