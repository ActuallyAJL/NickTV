// Remote-Watch configuration — committed and SECRET-FREE.
//
// Real values come from environment variables so no Plex token ever lands in git:
//   - Local dev: put them in a gitignored `.env.local` (see `.env.local.example`).
//   - Production (Azure Static Web App): inject as build-time env vars / GitHub secrets.
//
// NOTE: anything exposed as REACT_APP_* is embedded into the public client bundle at
// build time. That's unavoidable here because the browser talks to Plex directly — only
// deploy a token/collection you're comfortable being publicly readable.

// Plex server base URL. Local dev can use http://<ip>:<port>; a deployed HTTPS site needs
// the secure https://...plex.direct address (a plain http URL is blocked as mixed content).
export const url = process.env.REACT_APP_PLEX_URL || "";

// Plex X-Plex-Token.
export const key = process.env.REACT_APP_PLEX_TOKEN || "";

// The Movie library section id on your Plex server.
export const movieLibId = process.env.REACT_APP_MOVIE_LIB_ID || 1;

// Where the users/reviews/favorites data API lives.
//   - Production build: the bundled Azure Functions API, same origin under "/api".
//   - Local dev: json-server (override the default port with REACT_APP_DB_URL if needed).
export const dbURL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : process.env.REACT_APP_DB_URL || "http://localhost:8088";
