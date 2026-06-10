import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export const Register = ({ setAuthUser }) => {
  const [registerUser, setRegisterUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [conflictDialog, setConflictDialog] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const newUser = { ...registerUser };
    newUser[event.target.id] = event.target.value;
    setRegisterUser(newUser);
  };

  const existingUserCheck = () => {
    return fetch(`http://localhost:8088/users?email=${registerUser.email}`)
      .then((res) => res.json())
      .then((user) => !!user.length);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    existingUserCheck().then((userExists) => {
      if (!userExists) {
        fetch("http://localhost:8088/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: registerUser.email,
            name: `${registerUser.firstName} ${registerUser.lastName}`,
            idAdmin: false,
          }),
        })
          .then((res) => res.json())
          .then((createdUser) => {
            if (createdUser.hasOwnProperty("id")) {
              setAuthUser(createdUser.id);
              navigate("/");
            }
          });
      } else {
        setConflictDialog(true);
      }
    });
  };

  return (
    <main className="auth_body">
      <main className="container container--auth container--register">
        <dialog className="dialog dialog--password" open={conflictDialog}>
          <div>Account with that email address already exists</div>
          <button
            className="button--close button_auth"
            onClick={(e) => setConflictDialog(false)}
          >
            Close
          </button>
        </dialog>

        <form className="form--login" onSubmit={handleRegister}>
          <h1>Remote Watch</h1>
          <h2 className="h3 mb-3 font-weight-normal">
            Please Register for Application Name
          </h2>
          <fieldset className="fieldset_auth">
            <input
              type="text"
              name="firstName"
              id="firstName"
              className="form-control input_auth"
              placeholder="First name"
              required
              autoFocus
              value={registerUser.firstName}
              onChange={handleInputChange}
            />
          </fieldset>
          <fieldset className="fieldset_auth">
            <input
              type="text"
              name="lastName"
              id="lastName"
              className="form-control input_auth"
              placeholder="Last name"
              required
              value={registerUser.lastName}
              onChange={handleInputChange}
            />
          </fieldset>
          <fieldset className="fieldset_auth">
            <input
              type="email"
              name="email"
              id="email"
              className="form-control input_auth"
              placeholder="Email address"
              required
              value={registerUser.email}
              onChange={handleInputChange}
            />
          </fieldset>
          <fieldset className="fieldset_auth">
            <button type="submit" className="button_auth"> Sign in </button>
          </fieldset>
        </form>
      </main>
    </main>
  );
};
