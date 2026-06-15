const { app } = require("@azure/functions");
const { json } = require("../shared/tables");

// Server-side half of "Sign in with Discord" (NickTV plan, Phase 1).
//
// The browser never sees the client secret: it only obtains a short-lived OAuth2
// authorization `code` from Discord, then hands it here. This Function exchanges that
// code for an access token (using DISCORD_CLIENT_SECRET, kept in the Function App
// settings) and reads the user's identity. Node 18+ (the Functions v4 runtime) provides
// a global `fetch`, so no extra dependency is needed.
//
// Required app settings (Function App → Configuration, or local.settings.json for dev):
//   DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
const DISCORD_API = "https://discord.com/api";

// POST /api/auth/discord   body: { code, redirectUri }
app.http("authDiscord", {
  route: "auth/discord",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      context.error(
        "Discord OAuth not configured — set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET."
      );
      return json({ error: "Discord auth is not configured on the server." }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Expected a JSON body." }, 400);
    }
    const { code, redirectUri } = body || {};
    if (!code || !redirectUri) {
      return json({ error: "Missing 'code' or 'redirectUri'." }, 400);
    }

    // 1) Exchange the authorization code for an access token. `redirect_uri` must match
    //    the one used in the authorize request AND a redirect registered on the app.
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenRes.ok) {
      const detail = await tokenRes.text();
      context.error(`Discord token exchange failed (${tokenRes.status}): ${detail}`);
      return json({ error: "Discord token exchange failed." }, 401);
    }
    const token = await tokenRes.json();

    // 2) Read the user's identity (the `identify` scope grants this).
    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!userRes.ok) {
      const detail = await userRes.text();
      context.error(`Discord /users/@me failed (${userRes.status}): ${detail}`);
      return json({ error: "Failed to fetch Discord identity." }, 401);
    }
    const u = await userRes.json();

    // Phase 1 allowlist gate goes HERE: check `u.id` against the ~20-user allowlist and
    // return 403 if not permitted. For now any valid Discord account is admitted.
    return json({
      id: u.id, // Discord snowflake (string)
      username: u.username,
      globalName: u.global_name ?? null,
      avatar: u.avatar
        ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`
        : null,
    });
  },
});
