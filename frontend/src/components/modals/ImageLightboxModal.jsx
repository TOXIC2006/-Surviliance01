import { useChat } from '../../context/ChatContext';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import './Modals.css';

export default function ImageLightboxModal() {
  const { lightboxImage, setLightboxImage, addToast } = useChat();
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!lightboxImage) return null;

  const handleDownload = () => {
    addToast('Downloading image...', { type: 'info' });
  };

  return (
    <div
      className="modal-backdrop lightbox-backdrop"
      onClick={() => {
        setLightboxImage(null);
        setZoomLevel(1);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox Viewer"
    >
      <div className="lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn-icon btn-sm lightbox-btn"
          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>

        <button
          type="button"
          className="btn-icon btn-sm lightbox-btn"
          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>

        <button
          type="button"
          className="btn-icon btn-sm lightbox-btn"
          onClick={handleDownload}
          aria-label="Download image"
        >
          <Download size={18} />
        </button>

        <button
          type="button"
          className="btn-icon btn-sm lightbox-btn"
          onClick={() => {
            setLightboxImage(null);
            setZoomLevel(1);
          }}
          aria-label="Close lightbox"
        >
          <X size={18} />
        </button>
      </div>

      <div className="lightbox-image-stage" onClick={(e) => e.stopPropagation()}>
        <img
          src={lightboxImage}
          alt="Full preview"
          style={{ transform: `scale(${zoomLevel})` }}
          className="lightbox-main-img"
        />
      </div>
    </div>
  );
}
