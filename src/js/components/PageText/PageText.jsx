// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './PageText.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const PageText = ({ children, fontSize = 'medium', wysiwyg = true }) => {
  return <div className={clsx(style.wrap, style[fontSize], { 'font-wysiwyg': wysiwyg })}>{children}</div>;
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageText;
