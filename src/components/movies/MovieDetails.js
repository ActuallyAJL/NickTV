import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getMovieById } from "../modules/MovieManager";
import { NavBar } from "../nav/NavBar";
import {
  addFavorite,
  getFavoritesByMovieId,
  removeFavorite,
} from "../modules/FavoriteManager";
import { ReviewList } from "../reviews/ReviewList";
import "./MovieList.css";
import "../nav/NavBar.css";

export const MovieDetails = ({ getLoggedInUser, clearUser }) => {
  const [movie, setMovie] = useState({});
  const { movieId } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favId, setFavId] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = getLoggedInUser();

  useEffect(() => {
    getMovieById(movieId).then((thisMovie) => {
      setMovie(thisMovie.children[0]);
    });
    checkFavorites();
  }, []);

  const handleClick = () => {
    navigate(`/${movieId}/play`);
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

  const asciiParser = (text) => {
    let ascii = ["&#39;", "&#34;", "&amp;"];
    text = text?.replaceAll(ascii[0], "'");
    text = text?.replaceAll(ascii[1], '"');
    text = text?.replaceAll(ascii[2], "&");
    return text;
  };

  return (
    <div className="site">
      <NavBar clearUser={clearUser} />
      <div className="movie_detail_card">
        <div className="movie_detail_header">
          <div className="movie_detail_poster">
            {
              <img
                src={location.state.posterUrl}
                onClick={() => handleClick()}
              />
            }
          </div>
          <div className="movie_detail_info">
            <h1>{asciiParser(movie.attributes?.title)}</h1>
            <h2>{movie.attributes?.year}</h2>
            <h4>{asciiParser(movie.attributes?.summary)}</h4>
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
        </div>
        <ReviewList movieId={movieId} getLoggedInUser={getLoggedInUser} />
      </div>
    </div>
  );
};
