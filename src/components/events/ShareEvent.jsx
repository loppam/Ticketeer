import { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
} from "react-share";
import PropTypes from "prop-types";

export default function ShareEvent({ event, eventUrl }) {
  const [copied, setCopied] = useState(false);

  const shareText = `Join me at ${event.title}! ${event.description}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-event">
      <h3 className="share-title">Share Event</h3>

      <div className="share-buttons">
        <FacebookShareButton url={eventUrl} quote={shareText}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>

        <TwitterShareButton url={eventUrl} title={shareText}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>

        <WhatsappShareButton url={eventUrl} title={shareText}>
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>

        <TelegramShareButton url={eventUrl} title={shareText}>
          <TelegramIcon size={32} round />
        </TelegramShareButton>
      </div>

      <div className="share-link">
        <input type="text" value={eventUrl} readOnly className="share-input" />
        <button onClick={handleCopyLink} className="copy-button">
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}

ShareEvent.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  eventUrl: PropTypes.string.isRequired,
};
