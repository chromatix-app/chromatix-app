// ======================================================================
// IMPORTS
// ======================================================================

import style from './Title.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const Title = ({ title, subtitle, detail, thumb }) => {
  return (
    <div className={style.wrap}>
      {thumb && (
        <div className={style.thumb}>
          <img src={thumb} alt={title} />
        </div>
      )}
      <div className={style.content}>
        {title && <h1 className={style.title}>{title}</h1>}
        {subtitle && <h2 className={style.subtitle}>{subtitle}</h2>}
        {detail && <div className={style.detail}>{detail}</div>}
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Title;
