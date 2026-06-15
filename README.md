# NickTV

NickTV provides an alternative web-based interface for viewing movies that are part of a Plex Media Server collection.

![NickTV Homepage](/public/images/Homepage.png "NickTV Homepage")

## Installation

Fork or clone this project, then from the root directory run `npm install`.

Configuration is via environment variables (no secrets are committed). Copy
`.env.local.example` to `.env.local` (which is gitignored) and fill in your Plex details —
the server URL (IP/port), the Plex Key (X-Plex-Token), and your Movie Library ID. Set up
the local data store too: copy `api/database-template.json` to `api/database.json`.

## Usage

With `.env.local` and `api/database.json` in place, you need two terminals from the project
root:

- **Terminal 1:** `npm start` — the React app (http://localhost:3000).
- **Terminal 2:** `npm run server` — the json-server data API (users/reviews/favorites) on
  port 8088. (`json-server` is bundled as a dev dependency, so no separate install is
  needed.)

Log in with `admin@rm.com`. Happy Viewing

## Discord sign-in (local dev)

NickTV's login is **"Sign in with Discord"** (OAuth2). The browser obtains a one-time
authorization `code` from Discord and posts it to the Functions endpoint
`/api/auth/discord`, which exchanges it for the user's identity **server-side** so the
Discord **client secret never ships to the browser**. Because of that exchange step, the
**Functions app must be running** for login to work locally — the dev json-server does not
serve `/api/auth/discord`.

### One-time Discord app setup

1. Create an app at <https://discord.com/developers/applications>.
2. **OAuth2 → Redirects**, add the redirect URI(s) for every origin you'll sign in from
   (must match **exactly**):
   - `http://localhost:3000/auth/callback` (Option A below)
   - `http://localhost:4280/auth/callback` (Option B / SWA CLI)
   - `https://<your-swa-domain>/auth/callback` (production)
3. Copy the **Client ID** (public) and **Client Secret** (keep private).

### Required config (build-time vs runtime — they are different!)

| Value | Where it goes | Why |
| --- | --- | --- |
| `REACT_APP_DISCORD_CLIENT_ID` | **build-time** — `.env.local` (dev) / GitHub Actions secret (prod) | CRA bakes `REACT_APP_*` into the static JS at build time. |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | **runtime** — `api/local.settings.json` (dev) / Function App settings (prod) | Used only by the server-side token exchange. The secret must never reach the client bundle. |

> Setting `REACT_APP_*` in Azure SWA **Configuration** does **nothing** — those app
> settings only reach the Functions runtime, not the already-built static bundle. Build-time
> vars must be present when the GitHub Action builds.

### Option A — CRA + Functions (two terminals)

`.env.local` (repo root):

```ini
REACT_APP_DISCORD_CLIENT_ID=<your client id>
REACT_APP_AUTH_API_BASE=http://localhost:7071/api
```

`api/local.settings.json` (copy from `api/local.settings.json.example`) must contain
`DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`.

```sh
# Terminal 1 — backend (the --cors flag avoids "Failed to fetch" CORS errors)
cd api && func start --cors "http://localhost:3000"

# Terminal 2 — React app (restart after editing .env.local; CRA reads env only at startup)
npm start
```

Sign in at <http://localhost:3000>. Redirect URI: `http://localhost:3000/auth/callback`.

### Option B — SWA CLI (recommended; mirrors production, no CORS)

The SWA emulator serves the app and the API under **one origin** (`:4280`), so `/api` is
same-origin and CORS does not apply. No `REACT_APP_AUTH_API_BASE` needed.

```sh
npm i -g @azure/static-web-apps-cli
# Terminal 1: npm start    Terminal 2: cd api && func start
swa start http://localhost:3000 --api-location http://localhost:7071
```

Sign in at <http://localhost:4280>. Redirect URI: `http://localhost:4280/auth/callback`.

### Troubleshooting

- **"Failed to fetch"** — the Functions app isn't reachable or CORS blocked the request.
  Confirm `func start` is up on `:7071` and use `--cors` (Option A), or switch to Option B.
- **404 on sign-in** — the `/api/auth/discord` POST hit the CRA dev server, not the Functions
  app. Set `REACT_APP_AUTH_API_BASE` (Option A) or use Option B.
- **"Discord sign-in isn't configured"** on the login page — `REACT_APP_DISCORD_CLIENT_ID`
  was missing **at build time**. Add it and restart `npm start` (dev) or redeploy (prod).
- **Invalid redirect URI / failed exchange** — the redirect URI used must be registered on
  the Discord app **exactly**, including scheme, host, port, and path.

## Deploying to Azure

NickTV runs as **two separate resources**: an **Azure Static Web App** (Free, `eastus2`)
serving the React UI, and a **standalone Azure Functions app** (`func-nickTvApi-prod`,
Windows Consumption, `centralus`) serving the whole `/api` surface (auth, users, favorites,
reviews) backed by **Azure Table Storage**. They are provisioned by the Bicep template in the sibling `deployment/` repo. The
front end calls the Function App by its URL (`REACT_APP_API_BASE`); the Function App's CORS
allows the SWA origin.

> Why standalone (not the SWA managed API)? The cheapest SWA tier (Free) can't link a
> bring-your-own Function App — that needs Standard. A standalone Consumption Function App is
> also free-tier-friendly, so both resources stay at $0/low cost.

### 1. Provision Azure resources

Deploy `deployment/main.bicep` (creates the SWA, the Function App, and one storage account).
Then **seed the admin user** once against that storage account: from `api/`,
`TABLES_CONNECTION_STRING="<conn string>" npm run seed`.

### 2. Make Plex reachable (required, or no movies will load)

The browser streams **directly** from your Plex server, so a deployed HTTPS app needs:

- **Plex Remote Access enabled** so the server is reachable from the internet
  (Plex → Settings → Remote Access).
- An **HTTPS** Plex URL. A plain `http://<ip>:<port>` URL is blocked by the browser as
  *mixed content* on an HTTPS site. Use your server's secure `*.plex.direct` address (Plex
  issues these certs) — e.g. `https://<dash-encoded-ip>.<hash>.plex.direct:32400`.
- Plex **CORS** permitting your Static Web App origin.

Provide the HTTPS Plex URL, token, and library ID to the **production build** as
environment variables (the app reads `REACT_APP_PLEX_URL`, `REACT_APP_PLEX_TOKEN`,
`REACT_APP_MOVIE_LIB_ID`). Add them as **GitHub repo secrets** and pass them to the build
step via an `env:` block in the workflow. **Note:** REACT_APP_* values end up in the public
client bundle, so only deploy a collection/token you're comfortable exposing. Until these
are set the site still builds and deploys — movies just stay blank.

### 3. Deploy

Two workflows in `.github/workflows/` handle CD on push to `main`:

- **`azure-static-web-apps-*.yml`** — builds the React app and deploys it to the SWA
  (`api_location` is empty; the SWA no longer builds a managed API). Needs the build-time
  secrets `REACT_APP_DISCORD_CLIENT_ID` and `REACT_APP_API_BASE` (the Function App URL).
- **`deploy-functions.yml`** — deploys `api/` to `func-nickTvApi-prod`. Needs the
  `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` secret (Function App → *Get publish profile*).

Discord auth runtime settings (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`) and
`TABLES_CONNECTION_STRING` live on the **Function App** configuration (set by the Bicep, or
in the portal) — not the SWA.

## Help

If you need assistance with any of the above, reach me on Github or Twitter, @ActuallyAJL and I will send resources that will help.

## Contribution

Certain parts of this project were found online as open source. As such, the entire project is open-source and free to use. Feel free to add or change features and commit to a branch for approval.

## ERD

Here is my ERD for how data is handled by this app
![NickTV ERD](/public/images/ERD.png "NickTV ERD")

## User Stories

### User 1 : Stephen Bluette

As a frequent traveler,
I want to watch my personal movie collection on the go,
so that I don't have to pay a dozen different streaming subscriptions.

Given that I want to watch Boss Baby,
and I am not at home,
and I did not bring Boss Baby with me,
and I have Boss Baby on a remote server at home,
then I can stream it from this application.

### User 2: Amelia Eagerne

As a security-conscious collector,
I want to make sure only approved users are viewing my collection,
so that I dont have to worry about my collection's security.

Given that I attempts to log in to my collection,
and they have not logged in before,
then they will be asked to sign in or register using and email address.

### User 3: Conrad Hamilton

As someone who loves Romantic Comedies,
I want to watch only movies with a love story,
so that I dont have to waste my time scrolling through a big list.

Given that I want to watch a specific genre,
then I can select a genre in the navbar,
and view only movies that fit that genre.

### User 4: Leopold Angleplick

As a sophisticated cinophile,
I want to tell everyone what's wrong with their favorite movie,
so that I can educate the plebs and improve the world of Kino.

Given that I'd like to share my opinion about a movie
and I've clicked to view details of the movie,
when I click to add a review,
then I can rate a movie 1-5 stars, favorite it, and write a review,
and it will be stored for me to view again later.
