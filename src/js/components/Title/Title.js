// ======================================================================
// IMPORTS
// ======================================================================

import style from './Title.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Title = ({ title, subtitle, detail }) => {
  return (
    <div className={style.wrap}>
      {title && <h1 className={style.title}>{title}</h1>}
      {subtitle && <h2 className={style.subtitle}>{subtitle}</h2>}
      {detail && <div className={style.detail}>{detail}</div>}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Title;
