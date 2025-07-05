// ======================================================================
// IMPORTS
// ======================================================================

import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import style from './Button.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const getComponentType = (props) => {
  if (props.to) {
    return NavLink;
  } else if (props.href) {
    return 'a';
  } else {
    return 'button';
  }
};

export const Button = forwardRef(
  (
    { children, className, color, icon, inline = false, loading = false, type = 'button', size, wrap = true, ...props },
    ref
  ) => {
    const Component = getComponentType(props);

    const colorClass = color ? 'color' + color.charAt(0).toUpperCase() + color.slice(1) : '';
    const sizeClass = size ? 'size' + size.charAt(0).toUpperCase() + size.slice(1) : '';

    const ToReturn = (
      <Component
        ref={ref}
        className={clsx(className, style.btn, style[colorClass], style[sizeClass], {
          [style.loading]: loading,
          [style.inline]: inline,
        })}
        type={type}
        {...props}
      >
        {icon && <span className={style.icon}>{icon}</span>}
        {children}
      </Component>
    );

    return wrap ? <Wrap>{ToReturn}</Wrap> : ToReturn;
  }
);

const Wrap = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={clsx(style.wrap, className)} {...props}>
      {children}
    </div>
  );
});

// ======================================================================
// EXPORT
// ======================================================================

// This is required because of using forwardRef
Button.displayName = 'Button';

export default Button;
