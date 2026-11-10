# Spotikunai AI agent instructions

## Project shape
- This is an Expo + React Native app with file-based routing via `expo-router`. Screens live under `src/app/`; each file is a route (for example `src/app/index.tsx`, `login.tsx`, `detalhes/[id].tsx`). Keep screen logic there and put reusable UI in `src/components/`.
- The main app flow is centered on `src/app/index.tsx`: it loads the current user, album list, favorites, and search modal, and orchestrates create/edit/delete review actions.
- Shared domain types live in `src/data/albuns.ts` (`Album` interface). Use that shape for album-related state instead of inventing parallel types.
- Persistence and integration logic live in `src/services/`: `authService.ts` (AsyncStorage-based user auth), `albumStorage.ts` (local album/favorites persistence), `apiService.ts` (CRUD against the local Express API), and `spotifyService.ts` (proxy calls into the API layer).

## Service boundaries and data flow
- `src/app/index.tsx` does not call Spotify directly; it uses `spotifyService.buscarAlbuns()` to query the local Express API, which then proxies the Spotify API via `spotikunai-api/server.js`.
- `apiService.ts` points to `http://localhost:3000/albuns` on web and `http://192.168.1.100:3000/albuns` on device/emulator. If you test on a phone, update the local IP to match the machine running the API.
- `albumStorage.ts` is the bridge between server data and local storage: it fetches album data from `apiService`, saves it to AsyncStorage, and loads favorite IDs separately. This is why detail pages read from AsyncStorage instead of making a fresh fetch.
- `authService.ts` stores users and the logged-in user in AsyncStorage keys like `@spotikunai_users` and `@spotikunai_current_user`; there is no remote auth backend.

## Local API / backend
- The Express API is in `spotikunai-api/server.js` and exposes CRUD endpoints for albums plus Spotify proxy routes (`/spotify/search`, `/spotify/album/:id`).
- Spotify credentials must stay on the server side; do not add `SPOTIFY_CLIENT_ID`/`SECRET` to the React Native app or expose them in client code.
- Run the backend from `spotikunai-api/` with `npm install` and `npm start` or `node server.js`. If it is down, Spotify-based search in the app will fail with a connection error.

## Patterns to follow in code
- Prefer `useFocusEffect` for refreshes triggered when a screen regains focus, as seen in `src/app/index.tsx`.
- Use `AsyncStorage` directly for small local state like user sessions, favorites, and cached albums; this app does not use a state management library.
- Keep platform-specific behavior explicit: `Platform.OS === 'web' ? ... : ...` is used for `window.alert`, `window.confirm`, and local API URL selection.
- Styling is inline via `StyleSheet.create(...)` in screen/component files; the project does not use a separate CSS-in-JS system.
- Use `expo-router` navigation primitives (`router.push`, `router.replace`, `useLocalSearchParams`, `Link`) instead of custom navigation code.

## Commands and validation
- Install app deps: `npm install` at the repo root.
- Start the app: `npx expo start` (or `npm start`).
- Lint/typecheck before finishing work: `npx expo lint` and `npx tsc --noEmit`.
- Run the API: `cd spotikunai-api && npm install && npm start`.
- Do not hand-edit generated native folders (`ios/`, `android/`); Expo generates them when needed.
- There is no test suite configured in this repo; prefer static validation and the app’s existing patterns over adding new abstractions.

## Examples from this codebase
- `src/app/login.tsx` composes validation + `authService.login()` + route transition behavior in one screen.
- `src/services/spotifyService.ts` is the single client-side API abstraction for Spotify search, so new client screens should call it rather than fetch raw endpoints.
- `src/app/detalhes/[id].tsx` reads from AsyncStorage and resolves the album by `id` from `useLocalSearchParams`, matching the app’s local-first persistence strategy.
