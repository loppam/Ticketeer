import { useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import PropTypes from "prop-types";

export default function TicketAvailability({ eventId }) {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const eventRef = doc(db, "events", eventId);

    const unsubscribe = onSnapshot(
      eventRef,
      (doc) => {
        if (doc.exists()) {
          setTicketTypes(doc.data().ticketTypes);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to ticket updates:", error);
      }
    );

    return () => unsubscribe();
  }, [eventId]);

  const getAvailabilityMessage = (quantity) => {
    if (!user) {
      if (quantity === 0) return "Sold Out";
      if (quantity === 1) return "Last Card";
      if (quantity <= 5) return "Semi Last Card";
      if (quantity <= 10) return "Almost out";
      return "Still in stock";
    }
    return `Available: ${quantity}`;
  };

  const getAvailabilityClass = (quantity) => {
    if (quantity === 0) return "sold-out";
    if (quantity <= 2) return "critical-stock";
    if (quantity <= 5) return "very-low-stock";
    if (quantity <= 10) return "low-stock";
    return "";
  };

  if (loading) return <div>Loading ticket information...</div>;

  return (
    <div className="ticket-availability">
      {ticketTypes.map((ticket, index) => (
        <div key={index} className="ticket-type">
          <h3>{ticket.name}</h3>
          {ticket.description && (
            <p className="ticket-description">{ticket.description}</p>
          )}
          <p>Price: ₦{ticket.price}</p>
          <p
            className={`availability ${getAvailabilityClass(ticket.quantity)}`}
          >
            <span>{getAvailabilityMessage(ticket.quantity)}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

TicketAvailability.propTypes = {
  eventId: PropTypes.string.isRequired,
};
