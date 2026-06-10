import { dbURL } from "../Settings";

export const getReviewsByMovieId = (movieId) => {
  return fetch(`${dbURL}/reviews?movieId=${movieId}&_expand=user`)
  .then((res) => res.json()
  );
};

export const getReviewsByUserId = (userId) => {
  return fetch(`${dbURL}/reviews?userId=${userId}`).then((res) => res.json());
};

export const getReviewById = (reviewId) => {
  return fetch(`${dbURL}/reviews/${reviewId}`).then((res) => res.json());
};

export const addReview = (reviewObj) => {
  return fetch(`${dbURL}/reviews/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewObj),
  }).then((res) => res.json());
};

export const deleteReview = (reviewId) => {
  return fetch(`${dbURL}/reviews/${reviewId}`, {
    method: "DELETE",
  }).then((res) => res.json());
};

export const updateReview = (reviewObj) => {
  return fetch(`${dbURL}/reviews/${reviewObj.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewObj),
  }).then((res) => res.json());
};
