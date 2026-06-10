import XMLParser from "react-xml-parser";
import { url, key, movieLibId } from "../Settings";

export const getAllMovies = () => {
  return fetch(`${url}/library/sections/${movieLibId}/all?X-Plex-Token=${key}`)
    .then((res) => res.text())
    .then((res) => {
      const xml = new XMLParser().parseFromString(res);
      return xml;
    });
};

export const getMovieById = (movieId) => {
  return fetch(`${url}/library/metadata/${movieId}?X-Plex-Token=${key}`)
    .then((res) => res.text())
    .then((res) => {
      const xml = new XMLParser().parseFromString(res);
      return xml;
    });
};

export const getMoviePoster = (imgRoute) => {
  return fetch(`${url}${imgRoute}?X-Plex-Token=${key}`);
};
