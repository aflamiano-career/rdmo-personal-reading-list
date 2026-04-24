import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);

  const active = hovered || value;

  return (
    <div
      className={`star-rating star-rating--${size} ${readonly ? 'star-rating--readonly' : ''}`}
      role={readonly ? 'img' : 'group'}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-rating__star ${active >= star ? 'star-rating__star--filled' : ''}`}
          onClick={() => !readonly && onChange?.(star === value ? 0 : star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
