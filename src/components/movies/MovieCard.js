import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMoviePoster } from "../modules/MovieManager";
import {
  addFavorite,
  getFavoritesByMovieId,
  removeFavorite,
} from "../modules/FavoriteManager";
import "./MovieList.css";

export const MovieCard = ({ movie, getLoggedInUser }) => {
  const [poster, setPoster] = useState([]);
  const [isFavorite, setIsFavorite] = useState();
  const [favId, setFavId] = useState(0);

  const navigate = useNavigate();

  const currentUser = getLoggedInUser();
  const movieId = movie.attributes.ratingKey;

  const getPoster = () => {
    getMoviePoster(movie.attributes.thumb).then((thisPoster) => {
      setPoster(thisPoster);
    });
  };

  const handleClick = () => {
    navigate(`/${movie.attributes.ratingKey}/details`, {
      state: { posterUrl: poster.url },
    });
  };

  const checkFavorites = () => {
    getFavoritesByMovieId(movieId).then((favlist) => {
      favlist?.forEach((thisFav) => {
        if (thisFav.userId === currentUser) {
          setIsFavorite(true);
          setFavId(thisFav.id);
        }
      });
    });
  };

  const handleAddFavorite = () => {
    const newFavoriteMovie = {
      userId: currentUser,
      movieId: +movieId,
    };
    addFavorite(newFavoriteMovie);
    setIsFavorite(true);
    checkFavorites();
  };

  const handleRemoveFavorite = (favId) => {
    removeFavorite(favId);
    setIsFavorite(false);
    setFavId(0);
  };

  useEffect(() => {
    getPoster();
    checkFavorites();
  }, []);

  return (
    <>
      <div className="movie_card">
        {<img src={poster.url} onClick={() => handleClick()} />}
        <div className="actions">
          {isFavorite ? (
            <button
              type="button"
              className="remove_favorite_button"
              id={`remove_favorite_button--${movieId}`}
              onClick={() => {
                handleRemoveFavorite(favId);
              }}
            >
              <i className="bx bx-removeFav">
                <img
                  className="bx-icon remove-favorite-icon"
                  src="/images/favoriteicon.png"
                />
              </i>
            </button>
          ) : (
            <button
              type="button"
              className="add_favorite_button"
              id={`add_favorite_button--${movieId}`}
              onClick={handleAddFavorite}
            >
              <i className="bx bx-addFav">
                <img
                  className="bx-icon add-favorite-icon"
                  src="/images/notfavoriteicon.png"
                />
              </i>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
