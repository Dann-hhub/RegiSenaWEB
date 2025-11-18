import React from 'react';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Buscar…' }) {
  return (
    <div className="search-bar">
      <span className="search-icon" aria-hidden>🔎</span>
      <input
        className="input-modern search-input"
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
      {value?.length > 0 && (
        <button type="button" className="clear-icon" onClick={onClear} aria-label="Limpiar búsqueda">✕</button>
      )}
    </div>
  );
}