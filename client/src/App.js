import { Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FilmsPage from "./pages/FilmsPage";
import CustomersPage from "./pages/CustomersPage";
import ActorDetails from "./pages/ActorDetails";
import FilmDetails from "./pages/FilmDetails";
import CustomerDetails from "./pages/CustomerDetails";
import "./components/Navbar.css";

function App() {
  return (
    <div>
       <nav className="navbar">

        <div className="navbar-logo">
          🎬 Sakila Movie Store
        </div>

        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/films">Films</Link>
          <Link to="/customers">Customers</Link>
        </div>

      </nav>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/films" element={<FilmsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/actors/:id" element={<ActorDetails />} />
        <Route path="/films/:id" element={<FilmDetails />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
      </Routes>
    </div>
  );
}

export default App;
