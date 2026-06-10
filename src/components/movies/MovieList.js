import React, { useState, useEffect } from "react";
import { MovieCard } from "./MovieCard";
import { getAllMovies } from "../modules/MovieManager";
import { NavBar } from "../nav/NavBar";
import '../nav/NavBar.css'
import "./MovieList.css";

export const MovieList = ({ getLoggedInUser , clearUser }) => {
  const [movies, setMovies] = useState([]);

  const getMovies = () => {
    getAllMovies().then((theMovies) => {
      setMovies(theMovies.children);
    });
  };

  useEffect(() => {
    getMovies();
  }, []);

  return (
    <>
      <NavBar clearUser={clearUser} />
      <div className="movie_list">
        {movies.map((movie) => {
          return (
            <MovieCard
              key={movie.attributes?.ratingKey}
              movie={movie}
              getLoggedInUser={getLoggedInUser}
            />
          );
        })}
      </div>
    </>
  );
};
