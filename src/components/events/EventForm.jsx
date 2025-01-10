import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createEvent } from "../../services/eventService";
import PropTypes from "prop-types";

export default function EventForm({ onEventCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    eventCode: "",
    images: [],
    ticketTypes: [{ name: "", price: 0, quantity: 0, description: "" }],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTicketTypeChange = (index, field, value) => {
    const newTicketTypes = [...formData.ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    setFormData({ ...formData, ticketTypes: newTicketTypes });
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [
        ...formData.ticketTypes,
        { name: "", price: 0, quantity: 0, description: "" },
      ],
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }
    setFormData({ ...formData, images: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const event = await createEvent(formData, user.uid);
      onEventCreated?.(event.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Event Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Event Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={4}
          placeholder="Describe your event"
        />
      </div>

      <div className="form-group">
        <label>Event Date</label>
        <input
          type="datetime-local"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          required
          placeholder="Event venue or address"
        />
      </div>

      <div className="form-group">
        <label>Event Code (4 uppercase letters)</label>
        <input
          type="text"
          maxLength={4}
          value={formData.eventCode}
          onChange={(e) =>
            setFormData({
              ...formData,
              eventCode: e.target.value.toUpperCase(),
            })
          }
          pattern="[A-Z]{4}"
          required
        />
      </div>

      <div className="form-group">
        <label>Event Images (Max 3)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="file-input"
        />
      </div>

      <div className="form-group">
        <h3>Ticket Types</h3>
        {formData.ticketTypes.map((ticket, index) => (
          <div key={index} className="ticket-form-group">
            <div className="form-group">
              <label>Ticket Name</label>
              <input
                type="text"
                placeholder="e.g., VIP, Regular"
                value={ticket.name}
                onChange={(e) =>
                  handleTicketTypeChange(index, "name", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="e.g., Access to VIP area"
                value={ticket.description}
                onChange={(e) =>
                  handleTicketTypeChange(index, "description", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Price (₦)</label>
              <input
                type="number"
                placeholder="0"
                value={ticket.price}
                onChange={(e) =>
                  handleTicketTypeChange(index, "price", Number(e.target.value))
                }
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={ticket.quantity}
                onChange={(e) =>
                  handleTicketTypeChange(
                    index,
                    "quantity",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addTicketType}
          className="secondary-button"
        >
          Add Ticket Type
        </button>
      </div>

      <button type="submit" disabled={loading} className="primary-button">
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}

EventForm.propTypes = {
  onEventCreated: PropTypes.func,
};
