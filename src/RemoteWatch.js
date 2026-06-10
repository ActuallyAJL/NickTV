import React, { useState } from "react";
import { ApplicationViews } from "./components/ApplicationViews";
import "./RemoteWatch.css";

export const RemoteWatch = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("rm_user") !== null
  );

  const setAuthUser = (user) => {
    sessionStorage.setItem("rm_user", JSON.stringify(user));
    setIsAuthenticated(sessionStorage.getItem("rm_user") !== null);
  };

  const clearUser = () => {
    sessionStorage.clear();
    setIsAuthenticated(sessionStorage.getItem("rm_user") !== null);
  };

  const getLoggedInUser = () => {
    const thisUserId = parseInt(sessionStorage.getItem("rm_user"));
    return thisUserId;
  };

  return (
    <>
      <ApplicationViews
        setAuthUser={setAuthUser}
        clearUser={clearUser}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        getLoggedInUser={getLoggedInUser}
      />
    </>
  );
};
