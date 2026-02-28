export default function ToggleGroup({
  options = [],
  value,
  onChange,
  allowEmpty = false,
  className = '',
}) {
  return (
    <div className={`toggle-group ${className}`.trim()}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`toggle-pill ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (allowEmpty && isActive) {
                onChange('');
              } else {
                onChange(option.value);
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
