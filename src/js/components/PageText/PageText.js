// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './PageText.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const PageText = ({ children }) => {
  return <div className={clsx(style.wrap, 'font-wysiwyg')}>{children}</div>;
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageText;
