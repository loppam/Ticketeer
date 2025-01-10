import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

export default function MetaTags({ event, eventUrl }) {
  const imageUrl =
    event.imageUrl || `${window.location.origin}/default-event.jpg`;
  const formattedDate = new Date(event.date).toLocaleDateString();

  return (
    <Helmet>
      <title>{event.title}</title>
      <meta name="description" content={event.description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={eventUrl} />
      <meta property="og:title" content={event.title} />
      <meta property="og:description" content={event.description} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={eventUrl} />
      <meta property="twitter:title" content={event.title} />
      <meta property="twitter:description" content={event.description} />
      <meta property="twitter:image" content={imageUrl} />

      {/* Event specific metadata */}
      <meta property="event:date" content={formattedDate} />
      <meta property="event:location" content={event.location} />
    </Helmet>
  );
}

MetaTags.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
  eventUrl: PropTypes.string.isRequired,
};
