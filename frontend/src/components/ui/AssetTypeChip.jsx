import './AssetTypeChip.css';

const META = {
  LAPTOP: { short: 'LT', label: 'Laptop' },
  MONITOR: { short: 'MN', label: 'Monitor' },
  ACCESSORY: { short: 'AC', label: 'Accessory' },
};

const AssetTypeChip = ({ type, size = 'md' }) => {
  const key = type && META[type] ? type : null;
  const short = key ? META[key].short : String(type || '?').slice(0, 2).toUpperCase();
  const label = key ? META[key].label : type || 'Type';
  const cls = (key ? key : 'ACCESSORY').toLowerCase().replace('_', '-');

  return (
    <span
      className={`asset-type-chip asset-type-chip--${cls} asset-type-chip--${size}`}
      title={label}
    >
      {short}
    </span>
  );
};

export default AssetTypeChip;
