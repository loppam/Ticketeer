import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

export default function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHomePage = location.pathname === "/";
  const isRegistrationPage =
    location.pathname.includes("/events/") &&
    location.pathname.includes("/register") &&
    location.pathname.includes("/callback") &&
    location.pathname.includes("/success");

  // Check if we need to show navigation links
  const showNavLinks = user || (isHomePage && !isRegistrationPage);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            Ticketeer
          </Link>

          {showNavLinks && (
            <button className="menu-button" onClick={toggleMenu}>
              ☰
            </button>
          )}

          <div className={`nav-links ${!isMenuOpen ? "closed" : ""}`}>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/events/create" className="nav-link">
                  Create Event
                </Link>
                <button onClick={handleSignOut} className="sign-out-button">
                  Sign Out
                </button>
              </>
            ) : isHomePage && !isRegistrationPage ? (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="register-button">
                  Register
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
