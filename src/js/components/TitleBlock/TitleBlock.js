// ======================================================================
// IMPORTS
// ======================================================================

import clsx from 'clsx';

import style from './TitleBlock.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const TitleBlock = ({ title, subtitle, detail, thumb }) => {
  const titleSize = title.length <= 30 ? 'large' : title.length <= 40 ? 'medium' : 'small';

  return (
    <div className={style.wrap}>
      {thumb && (
        <div className={style.thumb}>
          <img src={thumb} alt={title} />
        </div>
      )}
      <div className={style.content}>
        {title && <h1 className={clsx(style.title, style[titleSize])}>{title}</h1>}
        {subtitle && <h2 className={style.subtitle}>{subtitle}</h2>}
        {detail && <div className={style.detail}>{detail}</div>}
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default TitleBlock;
