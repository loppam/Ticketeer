import { useState } from "react";
import {
  registerForEvent,
  createCheckoutOrder,
  updateRegistrationStatus,
} from "../../services/eventService";
import { generateTicketCode } from "../../utils/ticketUtils";
import PropTypes from "prop-types";

export default function RegistrationForm({ event }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    selectedTicketType: "",
    quantity: 1,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedTicket = event.ticketTypes.find(
    (ticket) => ticket.name === formData.selectedTicketType
  );

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (selectedTicket && value > selectedTicket.quantity) {
      setError(`Only ${selectedTicket.quantity} tickets available`);
      return;
    }
    setError("");
    setFormData({ ...formData, quantity: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const selectedTicket = event.ticketTypes.find(
        (ticket) => ticket.name === formData.selectedTicketType
      );

      if (!selectedTicket) {
        throw new Error("Please select a ticket type");
      }

      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        eventId: event.id,
        selectedTicketType: formData.selectedTicketType,
        ticketPrice: selectedTicket.price,
        quantity: formData.quantity,
        ticketCode: generateTicketCode(event.eventCode),
        status: "pending",
        createdAt: new Date(),
      };

      if (selectedTicket.price === 0) {
        const registration = await registerForEvent(registrationData);
        await updateRegistrationStatus(registration.id, "completed");
        window.location.href = `/registration/${registration.id}/success`;
        return;
      }

      const paymentData = await createCheckoutOrder(registrationData);
      await registerForEvent(registrationData);
      window.location.href = paymentData.checkout_url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Ticket Type</label>
        <select
          value={formData.selectedTicketType}
          onChange={(e) =>
            setFormData({ ...formData, selectedTicketType: e.target.value })
          }
          required
        >
          <option value="">Select a ticket type</option>
          {event.ticketTypes.map((ticket, index) => (
            <option key={index} value={ticket.name}>
              {ticket.name} - ₦{ticket.price}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="quantity">Quantity</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          min="1"
          max={selectedTicket ? selectedTicket.quantity : 1}
          value={formData.quantity}
          onChange={handleQuantityChange}
          required
        />
        {error && <p className="error-message">{error}</p>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Register"}
      </button>
    </form>
  );
}

RegistrationForm.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    ticketTypes: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
      })
    ).isRequired,
    eventCode: PropTypes.string.isRequired,
  }).isRequired,
};
