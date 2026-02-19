import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./CustomersPage.css";

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    email: ""
  });

  /* ================= FETCH CUSTOMERS ================= */

  useEffect(() => {
    fetchCustomers(page, searchTerm);
  }, [page, searchTerm]);

  const fetchCustomers = (pageNum = 1, search = "") => {
    const url = search
      ? `/customers/search?q=${search}`
      : `/customers?page=${pageNum}&limit=${limit}`;

    API.get(url)
      .then(res => {
        // SEARCH MODE
        if (search) {
          setCustomers(res.data || []);
          setTotalPages(1);
          setPage(1);
        }
        // PAGINATION MODE
        else {
          setCustomers(res.data.customers || []);

          const total = res.data.total || 0;
          setTotalPages(Math.max(1, Math.ceil(total / limit)));
        }
      })
      .catch(err => console.log(err));
  };

  /* ================= ADD CUSTOMER ================= */

  const handleAddCustomer = () => {
    if (!newCustomer.first_name || !newCustomer.last_name || !newCustomer.email) {
      alert("All fields are required!");
      return;
    }

    API.post("/customers", newCustomer)
      .then(res => {
        alert(`Customer added successfully! ID: ${res.data.customer_id}`);
        setShowForm(false);
        setNewCustomer({
          first_name: "",
          last_name: "",
          email: ""
        });
        fetchCustomers(page);
      })
      .catch(err => {
        console.error(err);
        alert("Failed to add customer. Please try again.");
      });
  };

  /* ================= EDIT CUSTOMER ================= */

  const handleEditCustomer = (customer) => {
    const first_name = prompt("First Name:", customer.first_name);
    const last_name = prompt("Last Name:", customer.last_name);
    const email = prompt("Email:", customer.email);

    if (!first_name || !last_name || !email) {
      alert("All fields are required!");
      return;
    }

    API.put(`/customers/${customer.customer_id}`, {
      first_name,
      last_name,
      email
    })
      .then(() => {
        alert("Customer updated successfully");
        fetchCustomers(page);
      })
      .catch(err => {
        console.log(err);
        alert("Failed to update customer");
      });
  };

  /* ================= DELETE CUSTOMER ================= */

  const handleDeleteCustomer = (customer_id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    API.delete(`/customers/${customer_id}`)
      .then(res => {
        alert(res.data?.message || "Customer deleted successfully");
        fetchCustomers(page);
      })
      .catch(err => {
        console.log(err);

        if (err.response?.data?.message) {
          alert("Failed to delete customer: " + err.response.data.message);
        } else if (err.response?.status === 500) {
          alert("Cannot delete customer: they may have active rentals.");
        } else {
          alert("Failed to delete customer. Please try again.");
        }
      });
  };

  /* ================= UI ================= */

  return (
    <div className="page-container">
      <h1> Customers</h1>

      {/* ===== SEARCH ===== */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by ID, first or last name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={() => fetchCustomers(1, searchTerm)}>
          Search
        </button>

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setPage(1);
              fetchCustomers(1);
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ===== ADD CUSTOMER ===== */}
      <div className="add-customer">
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Customer"}
        </button>

        {showForm && (
          <div className="customer-form">
            <input
              type="text"
              placeholder="First Name"
              value={newCustomer.first_name}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, first_name: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Last Name"
              value={newCustomer.last_name}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, last_name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={newCustomer.email}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, email: e.target.value })
              }
            />

            <button onClick={handleAddCustomer}>Save Customer</button>
          </div>
        )}
      </div>

      {/* ===== CUSTOMERS TABLE ===== */}
      <table className="customers-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customer_id}>
              <td>{customer.customer_id}</td>

              {/* clickable name */}
              <td
                className="clickable-name"
                onClick={() => navigate(`/customers/${customer.customer_id}`)}
              >
                {customer.first_name}
              </td>

              <td
                className="clickable-name"
                onClick={() => navigate(`/customers/${customer.customer_id}`)}
              >
                {customer.last_name}
              </td>

              <td>{customer.email}</td>

              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCustomer(customer);
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomer(customer.customer_id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== PAGINATION ===== */}
      {!searchTerm && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>

          <span>Page {page}</span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomersPage;
