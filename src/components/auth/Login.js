import React, { useState } from "react";
import { discordClientId, discordRedirectUri } from "../Settings";
import "./Login.css";

// Display fonts loaded in public/index.html. One is picked at random on each page load
// so the NickTV wordmark looks different every visit.
const TITLE_FONTS = [
  "'Monoton', cursive",
  "'Bungee', cursive",
  "'Audiowide', cursive",
  "'Faster One', cursive",
  "'Press Start 2P', cursive",
  "'Bowlby One SC', cursive",
  "'Wallpoet', cursive",
  "'Rubik Glitch', cursive",
  "'Silkscreen', cursive",
  "'Megrim', cursive",
];

const randomFont = () =>
  TITLE_FONTS[Math.floor(Math.random() * TITLE_FONTS.length)];

// High saturation + mid-high lightness keeps the color vivid and legible against the
// dark-grey / VHS-static background, whatever hue we land on.
const randomVividColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 90%, 62%)`;

export const Login = () => {
  // useState initializers run once per mount, so the font/color are fixed for the
  // visit but reroll on a full page (re)load.
  const [titleFont] = useState(randomFont);
  const [titleColor] = useState(randomVividColor);

  const handleDiscordLogin = () => {
    // CSRF guard: stash a random state to verify when Discord redirects back.
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem("discord_oauth_state", state);

    const params = new URLSearchParams({
      client_id: discordClientId,
      redirect_uri: discordRedirectUri,
      response_type: "code",
      scope: "identify",
      state,
      prompt: "consent",
    });

    window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
  };

  return (
    <main className="auth_body nicktv-login">
      <div className="nicktv-login__inner">
        <h1
          className="nicktv-login__title"
          style={{ fontFamily: titleFont, color: titleColor }}
        >
          NickTV
        </h1>

        <button
          type="button"
          className="nicktv-login__discord"
          onClick={handleDiscordLogin}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.2.358-.43.84-.59 1.222a18.27 18.27 0 0 0-5.59 0A12.6 12.6 0 0 0 9.106 3a19.74 19.74 0 0 0-4.435 1.369C1.864 8.59 1.1 12.7 1.482 16.75a19.9 19.9 0 0 0 6.073 3.078c.49-.668.927-1.377 1.304-2.122-.717-.27-1.404-.603-2.053-.997.172-.126.34-.258.502-.394 3.96 1.853 8.24 1.853 12.152 0 .164.14.332.272.502.394-.65.394-1.34.728-2.057.998.377.744.813 1.453 1.304 2.12a19.86 19.86 0 0 0 6.075-3.077c.448-4.694-.766-8.766-3.21-12.382ZM8.02 14.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.952-2.418 2.156-2.418 1.21 0 2.178 1.094 2.157 2.418 0 1.334-.953 2.419-2.157 2.419Zm7.962 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.952-2.418 2.156-2.418 1.21 0 2.178 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419Z"
            />
          </svg>
          Sign in with Discord
        </button>

        {!discordClientId && (
          <p className="nicktv-login__hint">
            Discord sign-in isn&rsquo;t configured yet &mdash; set
            <code> REACT_APP_DISCORD_CLIENT_ID</code> to enable it.
          </p>
        )}
      </div>
    </main>
  );
};
