import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/', { replace: true });
    window.location.reload();
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <h1 className="navbar-brand">
          <Link to="/" onClick={handleLogoClick}>
            <i className="fas fa-film"></i> Movie Recommendations
          </Link>
        </h1>
      </div>
    </nav>
  );
};

export default Navbar;