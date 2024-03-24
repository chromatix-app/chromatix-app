// ======================================================================
// IMPORTS
// ======================================================================

import style from './Title.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Title = ({ children }) => {
  return (
    <div className={style.wrap}>
      <h1>{children}</h1>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Title;
