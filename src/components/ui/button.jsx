import React from 'react';

// Ensure Button is exported by name
export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="button">
      {children}
    </button>
  );
}

