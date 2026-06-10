import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Login } from "./auth/Login";
import { Register } from "./auth/Register";
import { MovieList } from "./movies/MovieList";
import { MovieDetails } from "./movies/MovieDetails";
import { GenreMovieList } from "./genres/GenreMovieList";
import { Player } from "./player/Player";

export const ApplicationViews = ({
  isAuthenticated,
  setAuthUser,
  getLoggedInUser,
  clearUser,
}) => {
  const PrivateOutlet = () => {
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<PrivateOutlet />}>
          <Route
            path="/"
            element={
              <MovieList
                getLoggedInUser={getLoggedInUser}
                clearUser={clearUser}
              />
            }
          ></Route>
          <Route
            path="/:movieId/details"
            element={
              <MovieDetails
                getLoggedInUser={getLoggedInUser}
                clearUser={clearUser}
              />
            }
          ></Route>
          <Route path="/:movieId/play" element={<Player />}></Route>
          <Route
            path="/genre/:genreId"
            element={
              <GenreMovieList
                getLoggedInUser={getLoggedInUser}
                clearUser={clearUser}
              />
            }
          ></Route>
        </Route>

        <Route path="/login" element={<Login setAuthUser={setAuthUser} />} />
        <Route
          path="/register"
          element={<Register setAuthUser={setAuthUser} />}
        />
      </Routes>
    </>
  );
};
