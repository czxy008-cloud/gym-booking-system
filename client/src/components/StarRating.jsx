import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating, onRate, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating || 0;

  return (
    <div className={`star-rating ${size} ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= displayRating ? 'filled' : 'empty'}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
