import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'sonner';
import clsx from 'clsx';

import style from './ToastNotification.module.scss';

const isLocal = import.meta.env.VITE_ENV === 'local';
const devMode = !isLocal ? false : false;
const defaultDuration = !devMode ? 6000 : 999999999;

const ToastNotification = () => {
  const dispatch = useDispatch();
  const [counter, setCounter] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const notifications = useSelector(({ appModel }) => appModel.notifications);

  // Effect to show notifications from Redux store
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Get the latest notification
    const latestNotification = notifications[notifications.length - 1];

    // Show it with Sonner
    if (!latestNotification.debug || isLocal) {
      toast(latestNotification.title, {
        id: latestNotification.id,
        description: latestNotification.description,
        duration: latestNotification.duration || defaultDuration,
        onDismiss: () => dispatch.appModel.removeNotification(latestNotification.id),
        onAutoClose: () => dispatch.appModel.removeNotification(latestNotification.id),
        ...(latestNotification.debug ? { className: clsx(style.toast, style.toastDebug) } : {}),
      });
    }
  }, [notifications, dispatch.appModel]);

  // Test function to add a notification
  const addTestNotification = () => {
    if (!devMode) return;
    setCounter((prev) => prev + 1);
    dispatch.appModel.addNotification({
      title: `Playback error ${counter}`,
      description: `"This is a test notification.`,
    });
  };

  // Test function to add a notification on key press
  useEffect(() => {
    if (!devMode) return;
    const handleKeyDown = (event) => {
      if (event.key === 'a') {
        event.preventDefault();
        addTestNotification();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  return (
    <>
      <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        <Toaster
          position="bottom-left"
          className={style.wrap}
          gap={6}
          visibleToasts={isHovering ? 30 : 3}
          toastOptions={{
            className: style.toast,
            classNames: {
              title: style.title,
              description: style.description,
              closeButton: style.closeButton,
            },
            closeButton: true,
          }}
        />{' '}
      </div>

      {/* Test button for adding notifications */}
      {devMode && (
        <div className={style.dev}>
          <button type="button" onClick={addTestNotification}>
            Show Notification
          </button>
        </div>
      )}
    </>
  );
};

export default ToastNotification;
