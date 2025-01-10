import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Ticketeer</h1>
        <p>Create and manage your events with ease</p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button primary">
            Get Started
          </Link>
          <Link to="/login" className="cta-button secondary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
