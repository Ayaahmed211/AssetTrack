import './StatusBadge.css';

const StatusBadge = ({ 
  status, 
  variant = 'default',
  size = 'medium' 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'badge-success';
      case 'danger':
        return 'badge-danger';
      case 'warning':
        return 'badge-warning';
      case 'info':
        return 'badge-info';
      default:
        return 'badge-default';
    }
  };

  return (
    <span className={`status-badge ${getVariantClass()} badge-${size}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
