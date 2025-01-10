import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function SharePreview({ event, eventUrl }) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generatePreview() {
      try {
        const response = await fetch(eventUrl);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        setPreviewData({
          title:
            doc.querySelector('meta[property="og:title"]')?.content ||
            event.title,
          description:
            doc.querySelector('meta[property="og:description"]')?.content ||
            event.description,
          image:
            doc.querySelector('meta[property="og:image"]')?.content ||
            event.imageUrl,
        });
      } catch (error) {
        console.error("Error generating preview:", error);
      } finally {
        setLoading(false);
      }
    }

    generatePreview();
  }, [event, eventUrl]);

  if (loading) return <div>Loading preview...</div>;

  return (
    <div className="share-preview">
      <h3 className="text-lg font-semibold mb-2">Preview</h3>
      <div className="preview-card">
        {previewData?.image && (
          <img
            src={previewData.image}
            alt={previewData.title}
            className="preview-image"
          />
        )}
        <div className="preview-content">
          <h4 className="preview-title">{previewData?.title}</h4>
          <p className="preview-description">{previewData?.description}</p>
          <p className="preview-url">{new URL(eventUrl).hostname}</p>
        </div>
      </div>
    </div>
  );
}

SharePreview.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
  eventUrl: PropTypes.string.isRequired,
};
