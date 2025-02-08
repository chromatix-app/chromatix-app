// ======================================================================
// IMPORTS
// ======================================================================

import { Button, TitleBasic } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const ErrorPage = ({ title, body, buttonText, buttonClick }) => {
  return (
    <main className="wrap-inner">
      <div className="wrap-middle text-center">
        <TitleBasic title={title} />

        <div className="mt-15"></div>
        <div
          style={{
            maxWidth: 300,
            textWrap: 'balance',
          }}
        >
          {body}
        </div>
        <div className="mt-50"></div>

        {buttonText && buttonClick && (
          <Button className="btn btn-primary" onClick={buttonClick}>
            {buttonText}
          </Button>
        )}
      </div>
    </main>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ErrorPage;
