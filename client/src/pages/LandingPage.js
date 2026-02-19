import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./LandingPage.css";
import ActorDetails from "./ActorDetails";

function LandingPage() {
  const [films, setFilms] = useState([]);
  const [actors, setActors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Top Films
    API.get("/films/top")
      .then(res => setFilms(res.data || []))
      .catch(err => console.log(err));

    // Top Actors
    API.get("/actors/top")
       .then(res => setActors(res.data || []))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="landing-container">

      <h1 className="landing-title">🎬 Sakila Movie Dashboard</h1>

      {/* ================= TOP FILMS ================= */}
      <section className="landing-section">
        <h2>🔥 Top 5 Rented Films</h2>

        <div className="card-grid">
          {films.map(film => (
            <div
              key={film.film_id}
              className="card"
              onClick={() => navigate(`/films/${film.film_id}`)}
            >
              <h3>{film.title}</h3>
              <p><b>Category:</b> {film.category_name}</p>
              <p><b>Rentals:</b> {film.rental_count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TOP ACTORS ================= */}
      <section className="landing-section">
        <h2>⭐ Top Actors</h2>

        <div className="card-grid">
          {actors.map(actor => (
  <div
    key={actor.actor_id}
    className="actor-card"
    onClick={() => navigate(`/actors/${actor.actor_id}`)}
    style={{ cursor: "pointer" }}
  >
    <h3>{actor.actor_name}</h3>
    <p>⭐ {actor.rental_count} rentals</p>
  </div>
))}
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
