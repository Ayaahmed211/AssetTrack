import './FormInput.css';

const EmailInput = ({ 
  name = 'email', 
  value, 
  onChange, 
  placeholder = 'Enter your email',
  label = 'Email',
  error,
  required = false,
  disabled = false
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      <input
        type="email"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${error ? 'input-error' : ''}`}
        required={required}
        disabled={disabled}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default EmailInput;
