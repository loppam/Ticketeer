import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../hooks/useAuth";
import { getEvent } from "../services/eventService";
import RegistrationForm from "../components/events/RegistrationForm";
import CheckIn from "../components/events/CheckIn";
import TicketAvailability from "../components/events/TicketAvailability";
import ShareEvent from "../components/events/ShareEvent";
import MetaTags from "../components/common/MetaTags";
import ImageSlider from "../components/events/ImageSlider";

export default function EventDetails() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!event) return <div>Event not found</div>;

  const isCreator = user?.uid === event.creatorId;
  const eventUrl = `${window.location.origin}/events/${eventId}/register`;

  return (
    <div className="event-details-container">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <MetaTags event={event} eventUrl={eventUrl} />
          <div className="event-content">
            {event.images && event.images.length > 0 && (
              <ImageSlider images={event.images} />
            )}
            <div className="event-header">
              <h1 className="event-title">{event.title}</h1>
              <TicketAvailability eventId={eventId} />
            </div>

            <div className="event-body">
              {isCreator ? (
                <div className="creator-section">
                  <div className="event-management">
                    <div className="qr-section">
                      <h2 className="section-title">Event QR Code</h2>
                      <QRCodeSVG value={eventUrl} size={200} />
                    </div>
                    <ShareEvent event={event} eventUrl={eventUrl} />
                  </div>

                  <div className="check-in-section">
                    <h2 className="section-title">Check In Attendees</h2>
                    <CheckIn eventId={eventId} />
                  </div>
                </div>
              ) : (
                <div className="registration-section">
                  <h2 className="section-title">Register for Event</h2>
                  <RegistrationForm
                    event={event}
                    onRegistrationComplete={(registration) => {
                      alert(
                        `Registration successful! Your ticket code is: ${registration.ticketCode}`
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
