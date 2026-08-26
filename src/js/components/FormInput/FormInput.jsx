// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './FormInput.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const FormInput = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  error,
  color = 'primary',
  size = 'default',
  ...props
}) => {
  const colorClass = 'color' + color.charAt(0).toUpperCase() + color.slice(1);
  const sizeClass = 'size' + size.charAt(0).toUpperCase() + size.slice(1);

  return (
    <div className={style.wrap}>
      <input
        id={id}
        type={type}
        className={clsx(style.input, style[colorClass], style[sizeClass])}
        value={value || ''}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        {...props}
      />
      {error && <div className={clsx(style.error, style[sizeClass])}>{error}</div>}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FormInput;
