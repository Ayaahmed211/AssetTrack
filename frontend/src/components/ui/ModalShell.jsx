import React from 'react';
import './ModalShell.css';

const ModalShell = ({ isOpen, onClose, title, children, maxWidth = '500px' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-shell-overlay" onClick={onClose}>
      <div
        className="modal-shell-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        {title && <h3 className="modal-shell-title">{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export default ModalShell;
