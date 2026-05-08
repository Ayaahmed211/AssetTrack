import './AuthCard.css';

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <div className="auth-logo">
          <div className="auth-logo-icon">AT</div>
          <span className="auth-logo-text">AssetTrack</span>
        </div>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      </div>
      <div className="auth-card-body">
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
