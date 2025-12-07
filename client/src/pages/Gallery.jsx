import React from "react";
import "../styles/gallery.css";

const dummyImages = [
  "https://images.pexels.com/photos/167404/pexels-photo-167404.jpeg",
  "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg",
  "https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg",
  "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg",
  "https://images.pexels.com/photos/21067/pexels-photo.jpg",
  "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg",
];

const Gallery = () => {
  return (
    <section className="page gallery-page">
      <div className="page-inner">
        <div className="page-header">
          <h1>Gallery</h1>
          <p>A glimpse of our previous events and happy moments.</p>
        </div>

        <div className="gallery-grid">
          {dummyImages.map((src, index) => (
            <div key={index} className="gallery-item">
              <img src={src} alt={`event-${index}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
