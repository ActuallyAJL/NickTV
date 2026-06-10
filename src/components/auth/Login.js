import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export const Login = ({ setAuthUser }) => {
  const [loginUser, setLoginUser] = useState({ email: "" });
  const [existDialog, setExistDialog] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const newUser = { ...loginUser };
    newUser[event.target.id] = event.target.value;
    setLoginUser(newUser);
  };

  const existingUserCheck = () => {
    return fetch(`http://localhost:8088/users?email=${loginUser.email}`)
      .then((res) => res.json())
      .then((user) => (user.length ? user[0] : false));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    existingUserCheck().then((exists) => {
      if (exists) {
        setAuthUser(exists.id);
        navigate("/");
      } else {
        setExistDialog(true);
      }
    });
  };

  return (
    <main className="auth_body">
      <main className="container container--auth container--login">
        <div>
          <dialog className="dialog dialog--auth" open={existDialog}>
            <div>User does not exist</div>
            <button
              className="button--close button_auth"
              onClick={(e) => setExistDialog(false)}
            >
              Close
            </button>
          </dialog>
          <section>
            <form className="form--login" onSubmit={handleLogin}>
              <h1>Remote Watch</h1>
              <h2>Please sign in</h2>
              <fieldset className="fieldset_auth">
                <input
                  type="email"
                  id="email"
                  className="form-control input_auth"
                  placeholder="Email address"
                  required
                  autoFocus
                  value={loginUser.email}
                  onChange={handleInputChange}
                />
              </fieldset>
              <fieldset className="fieldset_auth">
                <button type="submit" className="button_auth">
                  Sign in
                </button>
              </fieldset>
              <fieldset className="link--register fieldset_auth">
                <Link to="/register">
                  <button className="button_auth">
                    Register for an account
                  </button>
                </Link>
              </fieldset>
            </form>
          </section>
        </div>
      </main>
    </main>
  );
};
