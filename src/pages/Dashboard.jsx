import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getCreatorEvents, deleteEvent } from "../services/eventService";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const userEvents = await getCreatorEvents(user.uid);
        setEvents(userEvents);
      } catch (error) {
        console.error("Error loading events:", error);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [user.uid]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteEvent(eventId);
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Events</h1>
        <Link to="/events/create" className="create-event-button">
          Create New Event
        </Link>
      </div>

      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <h2 className="event-title">{event.title}</h2>
            <p className="event-description">{event.description}</p>
            <div className="event-footer">
              <Link to={`/events/${event.id}`} className="event-link">
                View Details
              </Link>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="delete-button"
              >
                Delete Event
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
