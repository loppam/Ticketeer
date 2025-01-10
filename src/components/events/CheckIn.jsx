import { useState, useEffect, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { validateTicket, checkInTicket } from "../../services/eventService";
import PropTypes from "prop-types";

export default function CheckIn({ eventId }) {
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanner, setScanner] = useState(null);

  const validateAndCheckIn = useCallback(
    async (code) => {
      setLoading(true);
      setStatus(null);

      try {
        const ticket = await validateTicket(code, eventId);

        if (ticket.status === "used") {
          setStatus({ type: "error", message: "Ticket has already been used" });
          return;
        }

        await checkInTicket(code);
        setStatus({
          type: "success",
          message: `Check-in successful for ${ticket.attendeeName}`,
        });
      } catch (error) {
        setStatus({ type: "error", message: error.message });
      } finally {
        setLoading(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    if (scannerEnabled) {
      const newScanner = new Html5QrcodeScanner("reader", {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });

      newScanner.render(
        async (data) => {
          newScanner.clear();
          setScannerEnabled(false);
          await validateAndCheckIn(data);
        },
        (error) => {
          console.error(error);
        }
      );

      setScanner(newScanner);
    } else if (scanner) {
      scanner.clear();
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scannerEnabled, scanner, validateAndCheckIn]);

  const toggleScanner = () => {
    setScannerEnabled(!scannerEnabled);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    await validateAndCheckIn(ticketCode);
  };

  return (
    <div className="check-in-container">
      <div className="check-in-methods">
        <button onClick={toggleScanner} disabled={loading}>
          {scannerEnabled ? "Close Scanner" : "Scan QR Code"}
        </button>

        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            placeholder="Enter ticket code"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !ticketCode}>
            Check In
          </button>
        </form>
      </div>

      {scannerEnabled && <div id="reader"></div>}

      {status && (
        <div className={`status-message ${status.type}`}>{status.message}</div>
      )}
    </div>
  );
}

CheckIn.propTypes = {
  eventId: PropTypes.string.isRequired,
};
