import React from 'react';
import StatusBadge from '../ui/StatusBadge';
import AssetTypeChip from '../ui/AssetTypeChip';

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

const AssetHeader = ({ asset }) => {
  return (
    <div className="ad-header-card">
      <div className="ad-header-left">
        <div className="ad-type-badge">
          <AssetTypeChip type={asset.type} size="md" />
        </div>
        <div>
          <h1 className="ad-asset-title">{asset.brand} {asset.model}</h1>
          <div className="ad-asset-meta">
            <span className="ad-serial-number">SN: {asset.serialNumber}</span>
            <span className="ad-type-label">{asset.type}</span>
          </div>
        </div>
      </div>
      <div className="ad-header-badges">
        <StatusBadge
          status={asset.status?.replace('_', ' ')}
          variant={STATUS_VARIANT[asset.status] || 'default'}
        />
        <StatusBadge
          status={`Warranty: ${asset.warrantyStatus}`}
          variant={WARRANTY_VARIANT[asset.warrantyStatus] || 'default'}
        />
      </div>
    </div>
  );
};

export default AssetHeader;
