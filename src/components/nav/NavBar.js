import React from "react";
import { Link } from "react-router-dom";
import { GenreList } from "../genres/GenreList";
import "./NavBar.css";

export const NavBar = ({ clearUser }) => {
  return (
    <nav className="navbar">
      <ul className="nav-pills">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            All
          </Link>
        </li>
        <GenreList />
        <li className="nav-item">
          <button type="button" className="nav-link" onClick={clearUser}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};
