import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./FilmsPage.css";

function FilmsPage() {
  const [query, setQuery] = useState("");
  const [films, setFilms] = useState([]);

  const handleSearch = () => {
    API.get(`/films/search?q=${query}`)
      .then(res => setFilms(res.data))
      .catch(err => console.log(err));
  };

  return (
    <div className="films-page">

      <h1 className="films-title">🎬 Film Search</h1>

      {/* SEARCH BAR */}
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search by title, actor, or genre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* RESULTS */}
      <div className="films-grid">
        {films.map(film => (
          <Link
            key={film.film_id}
            to={`/films/${film.film_id}`}
            className="film-card"
          >
            <div className="film-title">{film.title}</div>
            <div className="film-category">
              {film.category || "Category"}
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}

export default FilmsPage;
