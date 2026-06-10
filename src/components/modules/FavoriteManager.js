import { dbURL } from "../Settings";

export const getFavoritesByMovieId = (movieId) => {
  return fetch(`${dbURL}/favorites?movieId=${movieId}`).then((res) =>
    res.json()
  );
};

export const getFavoritesByUserId = (userId) => {
  return fetch(`${dbURL}/favorites?userId=${userId}`).then((res) => res.json());
};

export const addFavorite = (favObj) => {
  return fetch(`${dbURL}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(favObj),
  }).then((res) => res.json());
};

export const removeFavorite = (favId) => {
  return fetch(`${dbURL}/favorites/${favId}`, {
    method: "DELETE",
  }).then((res) => res.json());
};
