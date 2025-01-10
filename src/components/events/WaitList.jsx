import { useState } from "react";
import { joinWaitlist } from "../../services/eventService";
import PropTypes from "prop-types";

export default function WaitList({ eventId, ticketType }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await joinWaitlist(eventId, ticketType, email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (submitted) {
    return (
      <p>
        You&apos;ve been added to the waitlist. We&apos;ll notify you when
        tickets become available.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Join Waitlist</button>
    </form>
  );
}

WaitList.propTypes = {
  eventId: PropTypes.string.isRequired,
  ticketType: PropTypes.string.isRequired,
};
