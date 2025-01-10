import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            Heads and Tails
          </Link>

          <div className="nav-links">
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
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="register-button">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
