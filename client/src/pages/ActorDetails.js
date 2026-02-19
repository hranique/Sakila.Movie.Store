import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "./LandingPage.css";

function ActorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actor, setActor] = useState(null);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  API.get(`/actors/${id}`)
    .then(res => {
      if (res.data && res.data.length > 0) {
        setActor({ actor_name: res.data[0].actor_name });
        setFilms(res.data);
      } else {
        setActor(null);
        setFilms([]);
      }
      setLoading(false);
    })
    .catch(err => {
      console.log(err);
      setLoading(false);
    });
}, [id]);


  if (loading) return <h2>Loading...</h2>;
  if (!actor) return <h2>Actor not found</h2>;

  return (
    <div className="landing-container">
      <h1 className="landing-title">{actor.actor_name}</h1>

      <section className="landing-section">
        <h2>🎥 Top 5 Rented Films</h2>
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
    </div>
  );
}

export default ActorDetails;
