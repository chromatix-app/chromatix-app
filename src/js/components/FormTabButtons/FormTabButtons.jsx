// ======================================================================
// IMPORTS
// ======================================================================

import { Button } from 'js/components';

import style from './FormTabButtons.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const FormTabButtons = ({ tabs }) => {
  return (
    <div className={style.buttons}>
      {tabs.map(({ label, icon, onClick, active, disabled, renderDisabled }) => (
        <Button
          key={label}
          size="tab"
          inline
          wrap={false}
          onClick={onClick}
          icon={icon}
          color={active ? 'mono' : 'secondary'}
          disabled={disabled}
          renderDisabled={renderDisabled}
          style={{ zIndex: active ? 2 : 'initial' }}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FormTabButtons;
