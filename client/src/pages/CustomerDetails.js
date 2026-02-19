import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./LandingPage.css";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);

  /* =========================
     Fetch Customer
  ========================== */
  const fetchCustomer = () => {
    API.get(`/customers/${id}`)
      .then(res => setCustomer(res.data))
      .catch(err => console.log(err));
  };

  /* =========================
     Fetch Rentals (✅ FIX)
  ========================== */
  const fetchRentals = () => {
    API.get(`/customers/${id}/rentals`)
      .then(res => setRentals(res.data || []))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  };

  /* =========================
     Load Page Data
  ========================== */
  useEffect(() => {
    fetchCustomer();
    fetchRentals();
  }, [id]);

  /* =========================
     Return Movie
  ========================== */
  const handleReturnMovie = (rentalId) => {
    API.put(`/rentals/${rentalId}/return`)
      .then(() => {
        alert("Movie returned successfully");
        fetchRentals(); // ✅ now exists
      })
      .catch(err => {
        console.error(err);
        alert("Failed to return movie");
      });
  };

  /* =========================
     Loading States
  ========================== */
  if (loading) return <h2>Loading...</h2>;
  if (!customer) return <h2>Customer not found</h2>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)}>← Back</button>

      <h2>📋 {customer.first_name} {customer.last_name}</h2>
      <p><b>Email:</b> {customer.email}</p>
      <p><b>Active:</b> {customer.active ? "Yes" : "No"}</p>

      <h3>Rental History</h3>

      {rentals.length === 0 ? (
        <p>No rentals found</p>
      ) : (
        <table className="customers-table">
          <thead>
            <tr>
              <th>Film</th>
              <th>Rented On</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.rental_id}>
                <td>{rental.title}</td>

                <td>
                  {new Date(rental.rental_date).toLocaleDateString()}
                </td>

                <td>
                  {rental.return_date ? (
                    new Date(rental.return_date).toLocaleDateString()
                  ) : (
                    <button
                      onClick={() =>
                        handleReturnMovie(rental.rental_id)
                      }
                    >
                      Return Movie
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CustomerDetails;
