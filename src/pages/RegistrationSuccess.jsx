import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { getRegistration } from "../services/eventService";
import { generateTicketCode } from "../utils/ticketUtils";

export default function RegistrationSuccess() {
  const { registrationId } = useParams();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRegistration() {
      try {
        const data = await getRegistration(registrationId);
        setRegistration(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRegistration();
  }, [registrationId]);

  const handleDownloadTicket = async () => {
    const ticketCard = document.querySelector(".ticket-card");
    if (!ticketCard) return;

    // Create an array of ticket numbers from 1 to quantity
    const ticketNumbers = Array.from(
      { length: registration.quantity },
      (_, i) => i + 1
    );

    // Generate all tickets
    for (const ticketNumber of ticketNumbers) {
      // Generate unique ticket code for each ticket
      const uniqueTicketCode =
        registration.ticketCode.split("-")[0] +
        "-" +
        generateTicketCode(
          registration.ticketCode.split("-")[0],
          ticketNumber
        ).split("-")[1];

      // Update the ticket number and code display before capturing
      const ticketNumberElement = ticketCard.querySelector(".ticket-number");
      const ticketCodeElement = ticketCard.querySelector(".ticket-code");

      if (ticketNumberElement) {
        ticketNumberElement.textContent = `Ticket ${ticketNumber} of ${registration.quantity}`;
      }
      if (ticketCodeElement) {
        ticketCodeElement.textContent = `Ticket Code: ${uniqueTicketCode}`;
      }

      // Capture and download the ticket
      const canvas = await html2canvas(ticketCard, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `ticket-${uniqueTicketCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    // Reset the ticket code display back to the original after all downloads
    const ticketCodeElement = ticketCard.querySelector(".ticket-code");
    if (ticketCodeElement) {
      ticketCodeElement.textContent = `Ticket Code: ${registration.ticketCode}`;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!registration) return <div>Registration not found</div>;

  return (
    <div className="registration-success-container">
      <div className="registration-success-header">
        <h1 className="registration-success-title">Registration Successful!</h1>
        <div className="ticket-container">
          <div className="ticket-card">
            <div className="ticket-header">
              <h2 className="ticket-title">Your Ticket</h2>
              {registration.quantity > 1 && (
                <p className="ticket-number">
                  Ticket 1 of {registration.quantity}
                </p>
              )}
              <div className="qr-container">
                <QRCodeSVG value={registration.ticketCode} size={200} />
              </div>
              <p className="ticket-code">
                Ticket Code: {registration.ticketCode}
              </p>
              <p className="attendee-name">{registration.name}</p>
            </div>

            <div className="ticket-details">
              <p>
                <span className="detail-label">Event:</span>{" "}
                {registration.eventTitle}
              </p>
              <p>
                <span className="detail-label">Date:</span>{" "}
                {new Date(registration.eventDate).toLocaleDateString()}
              </p>
              <p>
                <span className="detail-label">Location:</span>{" "}
                {registration.eventLocation}
              </p>
              <p>
                <span className="detail-label">Ticket Type:</span>{" "}
                {registration.selectedTicketType}
              </p>
              <p>
                <span className="detail-label">Quantity:</span>{" "}
                {registration.quantity}
              </p>
            </div>
          </div>

          <div className="ticket-actions">
            <button onClick={handleDownloadTicket}>Download Ticket</button>
            <Link to={`/events/${registration.eventId}`} className="back-link">
              Back to Event
            </Link>
          </div>
        </div>

        <div className="registration-note">
          <p>
            Please keep your ticket code safe. You&apos;ll need it for entry to
            the event.
          </p>
          <p>A copy of your ticket has also been sent to your email.</p>
        </div>
      </div>
    </div>
  );
}
