import EventForm from "../components/events/EventForm";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();

  const handleEventCreated = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <EventForm onEventCreated={handleEventCreated} />
    </div>
  );
}
