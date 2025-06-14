import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'sonner';
import style from './ToastNotification.module.scss';

const isLocal = process.env.REACT_APP_ENV === 'local';
const debug = !isLocal ? false : false;

const ToastNotification = () => {
  const dispatch = useDispatch();
  const [counter, setCounter] = useState(0);
  const notifications = useSelector(({ appModel }) => appModel.notifications);

  // Effect to show notifications from Redux store
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Get the latest notification
    const latestNotification = notifications[notifications.length - 1];

    // Show it with Sonner
    toast(latestNotification.title, {
      id: latestNotification.id,
      description: latestNotification.description,
      duration: latestNotification.duration || 3000,
      onDismiss: () => dispatch.appModel.removeNotification(latestNotification.id),
      onAutoClose: () => dispatch.appModel.removeNotification(latestNotification.id),
    });
  }, [notifications, dispatch.appModel]);

  // Test function to add a notification
  const addTestNotification = ({ duration }) => {
    if (!debug) return;
    setCounter((prev) => prev + 1);
    dispatch.appModel.addNotification({
      title: `Playback error ${counter}`,
      description: `"The Solace System" by Epica could not be played.`,
      type: 'info',
      duration: duration || 3000,
      // duration: duration || 999999999,
    });
  };

  // Test function to add a notification on key press
  useEffect(() => {
    if (!debug) return;
    const handleKeyDown = (event) => {
      if (event.key === 'a') {
        event.preventDefault();
        addTestNotification({ duration: 5000 });
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
      <Toaster
        position="bottom-left"
        className={style.wrap}
        gap={6}
        visibleToasts={3}
        toastOptions={{
          className: style.toast,
          classNames: {
            title: style.title,
            description: style.description,
            closeButton: style.closeButton,
          },
          closeButton: true,
        }}
      />

      {/* Test button for adding notifications */}
      {debug && (
        <div className={style.dev}>
          <button onClick={addTestNotification}>Show Notification</button>
        </div>
      )}
    </>
  );
};

export default ToastNotification;
