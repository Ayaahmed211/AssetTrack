import React from 'react';

const WarrantyAlert = ({ warrantyStatus, daysUntilWarrantyExpiry }) => {
  if (warrantyStatus === 'VALID') return null;

  const isExpired = warrantyStatus === 'EXPIRED';
  const days = Math.abs(daysUntilWarrantyExpiry);

  return (
    <div className={`ad-warranty-alert ${isExpired ? 'ad-alert-danger' : 'ad-alert-warning'}`}>
      <span className={`ad-alert-marker ${isExpired ? 'ad-alert-marker--danger' : 'ad-alert-marker--warn'}`} aria-hidden />
      <div>
        <strong>{isExpired ? 'Warranty Expired' : 'Warranty Expiring Soon'}</strong>
        <p>
          {isExpired
            ? `This asset's warranty expired ${days} day${days !== 1 ? 's' : ''} ago.`
            : `Warranty expires in ${days} day${days !== 1 ? 's' : ''}.`}
        </p>
      </div>
    </div>
  );
};

export default WarrantyAlert;
