import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { discordRedirectUri, authApiBase } from "../Settings";
import "./Login.css";

// Landing route Discord redirects back to after the user authorizes. It verifies the
// CSRF state, hands the authorization code to the Functions backend (which does the
// secret-bearing token exchange), then stores the returned identity and enters the app.
export const AuthCallback = ({ setAuthUser }) => {
  const [error, setError] = useState(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    // React 18 StrictMode invokes effects twice in dev; an OAuth code is single-use, so
    // guard against exchanging it twice.
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const expectedState = sessionStorage.getItem("discord_oauth_state");
    sessionStorage.removeItem("discord_oauth_state");

    if (params.get("error")) {
      setError(`Discord declined the sign-in (${params.get("error")}).`);
      return;
    }
    if (!code) {
      setError("No authorization code returned from Discord.");
      return;
    }
    if (!state || state !== expectedState) {
      setError("Sign-in state mismatch — please try again.");
      return;
    }

    fetch(`${authApiBase}/auth/discord`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri: discordRedirectUri }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Sign-in failed (${res.status}).`);
        }
        return res.json();
      })
      .then((user) => {
        setAuthUser(user);
        navigate("/", { replace: true });
      })
      .catch((err) => setError(err.message));
  }, [params, navigate, setAuthUser]);

  return (
    <main className="auth_body nicktv-login">
      <div className="nicktv-login__inner">
        {error ? (
          <>
            <p className="nicktv-login__hint">{error}</p>
            <button
              type="button"
              className="nicktv-login__discord"
              onClick={() => navigate("/login", { replace: true })}
            >
              Back to sign in
            </button>
          </>
        ) : (
          <p className="nicktv-login__status">Completing sign-in&hellip;</p>
        )}
      </div>
    </main>
  );
};
