// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './PageText.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const PageText = ({ children, color = 'primary', fontSize = 'medium', fullWidth = false, wysiwyg = true }) => {
  return (
    <div
      className={clsx(style.wrap, style[fontSize], {
        [style.secondary]: color === 'secondary',
        [style.fullWidth]: fullWidth,
        'font-wysiwyg': wysiwyg,
      })}
    >
      {children}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageText;
