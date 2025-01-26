// ======================================================================
// IMPORTS
// ======================================================================

import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon } from 'js/components';

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
  ({ children, className, loading = false, variant, type = 'button', wrap = true, ...props }, ref) => {
    const Component = getComponentType(props);

    const ToReturn = (
      <Component
        ref={ref}
        className={clsx(style.btn, style[variant], className, { [style.loading]: loading })}
        type={type}
        {...props}
      >
        {variant === 'download' && (
          <span className={style.icon}>
            <Icon icon="DownloadIcon" cover stroke strokeWidth={1.4} />
          </span>
        )}
        {variant === 'downloadMac' && (
          <span className={style.icon}>
            <Icon icon="AppleSiteIcon" cover />
          </span>
        )}
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
