import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "./FilmsPage.css";

function FilmDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [rentMessage, setRentMessage] = useState("");

  // Fetch film details
  useEffect(() => {
    API.get(`/films/${id}`)
      .then(res => {
        setFilm(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  const handleRent = () => {
    if (!customerId) {
      setRentMessage("Please enter a customer ID.");
      return;
    }

    API.post("/rentals", {
      customer_id: customerId,
      film_id: film.film_id
    })
      .then(res => setRentMessage(res.data.message))
      .catch(err => {
        console.log(err);
        setRentMessage("Error renting film. Make sure the ID is correct.");
      });
  };

  if (loading) return <h2>Loading...</h2>;
  if (!film || film.message) return <h2>Film not found.</h2>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} style={{ marginBottom: "15px" }}>
        ← Back
      </button>

      <h2>{film.title}</h2>
      <p><b>Description:</b> {film.description}</p>
      <p><b>Category:</b> {film.category}</p>
      <p><b>Release Year:</b> {film.release_year}</p>
      <p><b>Rating:</b> {film.rating}</p>
      <p><b>Length:</b> {film.length} minutes</p>
      <p><b>Actors:</b> {film.actors}</p>

      <hr />

      <h3>Rent this film</h3>
      <input
        type="number"
        placeholder="Enter Customer ID"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        style={{ padding: "6px 10px", marginRight: "10px", borderRadius: "6px" }}
      />
      <button onClick={handleRent} style={{ padding: "6px 12px", borderRadius: "6px" }}>
        Rent Film
      </button>

      {rentMessage && <p style={{ marginTop: "10px", fontWeight: "bold", color: "green" }}>{rentMessage}</p>}
    </div>
  );
}

export default FilmDetails;
