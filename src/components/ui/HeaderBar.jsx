import React from 'react';

export default function HeaderBar({ title, subtitle, count, children, right }) {
  return (
    <div className="header-bar">
      <div className="header-left">
        <h2 className="header-title">{title}</h2>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
        {typeof count === 'number' && (
          <span className="header-count">{count} resultados</span>
        )}
      </div>
      <div className="header-right">
        {children}
        {right}
      </div>
    </div>
  );
}