// src/components/Layout.js
import { Outlet, Link } from "react-router-dom";

function Layout() {
  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "#1E90FF",
    color: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    marginRight: "20px",
    fontWeight: "bold",
    transition: "color 0.2s",
  };

  const hoverLink = (e) => (e.target.style.color = "#FFD700");
  const leaveLink = (e) => (e.target.style.color = "white");

  return (
    <div>
      <nav style={navStyle}>
        <div>
          <Link to="/" style={linkStyle} onMouseEnter={hoverLink} onMouseLeave={leaveLink}>Home</Link>
          <Link to="/films/top" style={linkStyle} onMouseEnter={hoverLink} onMouseLeave={leaveLink}>Films</Link>
          <Link to="/customers" style={linkStyle} onMouseEnter={hoverLink} onMouseLeave={leaveLink}>Customers</Link>
        </div>
        <div>Video Store Admin</div>
      </nav>

      <div className="page-container">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
