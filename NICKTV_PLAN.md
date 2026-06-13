# NickTV — Rebrand & Rebuild Plan

> Planning document. Captures the intended evolution of this project from **Remote-Watch**
> (a personal Plex movie browser) into **NickTV**, a full-stack, Azure-hosted, invite-only
> streaming app whose headline feature is a synchronized live channel. Nothing here is built
> yet — this is the roadmap and a rough draft of steps.

## Question answered: can you rename the GitHub repo without losing history?

**Yes.** Renaming a repo on GitHub (Settings → *General* → *Repository name*) preserves
**everything**: full commit history, branches, tags, issues, PRs, releases, stars, watchers.
GitHub also installs **redirects** from the old name/URL to the new one, so existing clones
and links keep working — old `git push`/`pull` against the old URL are redirected.

Practical follow-ups after the rename:

- **Update local remotes** to the new canonical URL (redirects work, but don't rely on them
  long-term): `git remote set-url portfolio https://github.com/ActuallyAJL/NickTV.git`.
- **Rename the local folder** `Remote-Watch\` → `NickTV\` to match (optional but tidy).
- **Workspace manifest.** The workspace sync (`config\workspace.json`) is **keyed by the
  Portfolio repo name**, so its `Remote-Watch` entry must be re-keyed to `NickTV` (path +
  `updatedAt`). The `portfolio` remote-name normalization itself is fine — it matches on the
  `github.com` + `ActuallyAJL` URL pattern, not the repo name.
- Anything referencing the old name (README badges, Azure resource names, CI workflow file
  names) should be swept — see the checklist below.

**Recommendation:** rename the GitHub repo and update remotes *first*, as one clean commit's
worth of housekeeping, before starting the in-app rebrand.

## Target product

**NickTV** — a full-stack web app, hosted in **Azure 24/7**, invitation-only, that streams
from a personal **Plex** server. Two tiers of feature:

1. **NickTV Live (primary / home page)** — a single "channel" that plays Plex content on a
   **predetermined schedule**, in **perfect sync** for everyone watching, with a persistent
   on-screen chat. This is the front door and the main event.
2. **On-demand library (secondary)** — the current Remote-Watch behavior (browse a list,
   pick a movie, watch it yourself) demoted to a secondary mode.

### Authentication & access model

- **Discord-only auth.** Sign in exclusively via **Discord OAuth2**. No email/password.
  (Replaces today's email-only, no-password `sessionStorage` login.)
- **Invite-only, ~20 users.** An **Admin manages the allowlist from within Discord** (e.g. a
  bot command / a role in a specific guild). Membership of the allowlist (or a role/guild) is
  what grants access — the app checks the Discord identity against it on login.
- **Temporary resume-link access (12 h).** A special link (to be placed in the owner's
  résumé) grants **12 hours** of access **without manual auth or identification**. Rules:
  - Access is tied to the **session/link grant**, not a person: once 12 h elapse, that
    session can no longer access the site.
  - A **different** person using the **same link** later still gets their own fresh 12 h.
  - So the link is reusable, but each *grant* is single-use-window and time-boxed.
  - **Not bulletproof by design** — good enough to keep an expired guest out while letting a
    new visitor in via the same URL. (Likely a signed, short-lived token minted on link hit +
    a per-grant record; see "Open design questions".)

### NickTV Live — the synced channel

- **Scheduled programming.** A schedule maps wall-clock time → Plex content (movies / shows /
  episodes). The "what's on now" is a pure function of the current time and the schedule.
- **Perfect sync.** Every viewer sees the **same content at the same playback position**.
  Server is the source of truth for "current item + offset"; clients seek to match and
  resync on drift. Late joiners drop into the live position, not the start.
- **Discord-channel viewing.** Live is viewable from within a Discord channel (e.g. an
  embedded activity / a player surfaced in Discord) as well as the web app — TBD which
  mechanism (Discord Embedded App SDK / Activities vs. a linked web view).
- **Persistent chat.** A simple always-on chat overlay on the Live screen:
  - Shows the commenter's **Discord username**.
  - Comments are **immutable** — cannot be edited or deleted once posted.
  - Each comment is stored with a **content timestamp**: the name of the movie/show/episode
    playing at that moment **and the position within it** (not just wall-clock), so the chat
    log reads as commentary anchored to the content.
  - Chat is **persistent** (survives reloads; history is retained).

## Architecture sketch (Azure, 24/7)

Today the app is a CRA front end + a json-server/Azure-Functions data API + direct-to-Plex
streaming. NickTV needs more always-on, stateful infrastructure:

- **Front end** — keep React (or migrate during rebrand); served as static content.
- **API + realtime** — the live-sync clock, chat fan-out, and presence need a **persistent
  connection** (WebSockets). Azure Functions alone is request/response; consider:
  - **Azure Web PubSub** or **SignalR Service** for the realtime chat + sync broadcast, with
    Functions as the HTTP/management layer, **or**
  - A small **always-on App Service / Container App** running a Node WebSocket server (better
    fit for a continuously-ticking channel clock and watch-party sync).
- **State** — Discord identities + allowlist, the schedule, immutable chat log, and active
  access-grants. Table Storage (current) is fine for chat/log; the allowlist + grants may
  want something with easy querying. Decide as part of design.
- **Plex** — same direct-stream constraints as today (HTTPS `*.plex.direct`, Remote Access,
  CORS, token exposure). Sync playback still streams from Plex per-client; the server only
  broadcasts *what* and *where*, not the video bytes.
- **Discord** — OAuth2 app + likely a **bot** (for the in-Discord admin allowlist commands
  and possibly the in-channel viewing/Activity).

## Rough draft of steps

Phased so each phase leaves a working app.

**Phase 0 — Rebrand & rename (housekeeping)**
1. Rename the GitHub repo `Remote-Watch` → `NickTV`; update `portfolio` remote URL; rename
   local folder; re-key `config\workspace.json`.
2. Sweep in-app branding: app title, `package.json` name, README, headers/nav, favicon,
   `public/` assets, any "Remote-Watch" strings, Azure resource/workflow names.

**Phase 1 — Auth overhaul (Discord)**
3. Register a Discord OAuth2 application (+ bot if needed). Add redirect URIs.
4. Replace the email-only login with Discord OAuth login; store identity in a real session.
5. Build the **allowlist check** against Discord (role/guild membership or a stored list).
6. Build the **Discord-side admin controls** (bot command / role) to add/remove the ~20
   users.

**Phase 2 — Temporary résumé-link access**
7. Design the grant token: link-hit mints a signed, 12-h token + a per-grant record; gate the
   app on a valid, unexpired grant; ensure expiry locks the old visitor out while a new
   visitor on the same link gets a fresh grant.

**Phase 3 — Realtime backbone**
8. Stand up the always-on realtime layer (Web PubSub / SignalR / WS server on App Service or
   Container Apps). Prove a basic broadcast + presence round-trip.

**Phase 4 — NickTV Live (the headline)**
9. Define the **schedule** data model + admin tooling to program it.
10. Implement the **server clock**: "current item + offset" derived from schedule + now.
11. Build the **synced player**: join-at-live-position, drift correction, resync.
12. Make **Live the home page**; demote the existing browse/watch flow to a secondary route.

**Phase 5 — Persistent chat**
13. Immutable chat store; render Discord username; **content-anchored timestamps** (title +
    position captured from the live clock at post time); persistence + history load.

**Phase 6 — Discord-channel viewing**
14. Surface Live inside a Discord channel (evaluate Discord Embedded App SDK / Activities vs.
    a linked web view) and wire chat/identity through.

**Phase 7 — Azure 24/7 hardening**
15. Move off request/response-only hosting to keep the channel and realtime layer always on;
    configuration, secrets, monitoring, cost check.

## Open design questions

- Realtime host: **Web PubSub/SignalR + Functions** vs. an **always-on WS server**? (The
  continuously-ticking channel clock leans toward always-on.)
- Resume-link grants: where stored, what token format, how is "this grant expired but the
  link still works for someone new" enforced cleanly?
- In-Discord viewing: full **Discord Activity** (Embedded App SDK) or just a link out to the
  web app? Affects how much lives inside Discord.
- Schedule authoring: hand-edited config vs. an admin UI vs. Discord bot commands.
- Does on-demand viewing stay synced-optional, or fully independent of Live?
- Plex token exposure in a now-public-ish (résumé-linked) app — acceptable risk, or proxy
  streams through the backend?
