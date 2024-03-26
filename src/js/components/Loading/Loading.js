// ======================================================================
// IMPORTS
// ======================================================================

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import style from './Loading.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const Loading = ({ forceVisible, inline, route }) => {
  const loaderVisible = useSelector(({ appModel }) => appModel.loaderVisible);

  if (loaderVisible || forceVisible) {
    return <div className={clsx(style.loader, { [style.inline]: inline, [style.route]: route })}>Loading...</div>;
  } else {
    return null;
  }
};

// ======================================================================
// PROPTYPES
// ======================================================================

Loading.propTypes = {
  forceVisible: PropTypes.bool,
  inline: PropTypes.bool,
  route: PropTypes.bool,
  // loaderVisible: PropTypes.bool.isRequired,
};

// ======================================================================
// EXPORT
// ======================================================================

export default Loading;
