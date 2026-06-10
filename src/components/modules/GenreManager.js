import XMLParser from "react-xml-parser";
import { url, key, movieLibId } from "../Settings";

export const getAllGenres = () => {
  return fetch(
    `${url}/library/sections/${movieLibId}/genre?X-Plex-Token=${key}`
  )
    .then((res) => res.text())
    .then((res) => {
      const xml = new XMLParser().parseFromString(res);
      return xml;
    });
};

export const getMoviesByGenreId = (genreId) => {
  return fetch(
    `${url}/library/sections/${movieLibId}/all?X-Plex-Token=${key}&genre=${genreId}`
  )
    .then((res) => res.text())
    .then((res) => {
      const xml = new XMLParser().parseFromString(res);
      return xml;
    });
};
