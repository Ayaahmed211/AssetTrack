import React from 'react';
import StatusBadge from '../ui/StatusBadge';

const STATUS_VARIANT = {
  AVAILABLE: 'success',
  ASSIGNED: 'info',
  UNDER_MAINTENANCE: 'warning',
  DECOMMISSIONED: 'danger',
};

const WARRANTY_VARIANT = {
  VALID: 'success',
  EXPIRING_SOON: 'warning',
  EXPIRED: 'danger',
};

const InfoRow = ({ label, value, children }) => (
  <div className="ad-info-row">
    <span className="ad-info-label">{label}</span>
    <span className="ad-info-value">{children ?? value ?? '—'}</span>
  </div>
);

const InfoGrid = ({ asset }) => {
  return (
    <div className="ad-section-card">
      <h2 className="ad-section-title">Asset Information</h2>
      <div className="ad-info-grid">
        <InfoRow label="Brand" value={asset.brand} />
        <InfoRow label="Model" value={asset.model} />
        <InfoRow label="Type" value={asset.type} />
        <InfoRow label="Serial Number">
          <code className="ad-code">{asset.serialNumber}</code>
        </InfoRow>
        <InfoRow label="Status">
          <StatusBadge
            status={asset.status?.replace('_', ' ')}
            variant={STATUS_VARIANT[asset.status] || 'default'}
            size="small"
          />
        </InfoRow>
        <InfoRow
          label="Purchase Date"
          value={
            asset.purchaseDate
              ? new Date(asset.purchaseDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })
              : '—'
          }
        />
        <InfoRow
          label="Warranty Expires"
          value={
            asset.warrantyExpirationDate
              ? new Date(asset.warrantyExpirationDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })
              : '—'
          }
        />
        <InfoRow label="Warranty Status">
          <StatusBadge
            status={asset.warrantyStatus}
            variant={WARRANTY_VARIANT[asset.warrantyStatus] || 'default'}
            size="small"
          />
        </InfoRow>
        {asset.notes && (
          <div className="ad-notes-block">
            <span className="ad-info-label">Notes</span>
            <p className="ad-notes-text">{asset.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoGrid;
