// ======================================================================
// IMPORTS
// ======================================================================

import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import style from './Button.module.scss';

// ======================================================================
// RENDER
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
  ({ children, className, loading = false, size = 'medium', type = 'button', ...props }, ref) => {
    const Component = getComponentType(props);

    return (
      <div className={style.wrap}>
        <Component
          ref={ref}
          className={clsx(style.btn, style[size], className, { [style.loading]: loading })}
          type={type}
          {...props}
        >
          {children}
        </Component>
      </div>
    );
  }
);

// ======================================================================
// EXPORT
// ======================================================================

// This is required because of using forwardRef
Button.displayName = 'Button';

export default Button;
