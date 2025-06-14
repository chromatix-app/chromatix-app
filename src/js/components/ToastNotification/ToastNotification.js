import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as RadixToast from '@radix-ui/react-toast';
import clsx from 'clsx';
import style from './ToastNotification.module.scss';

const isLocal = process.env.REACT_APP_ENV === 'local';
const debug = !isLocal ? false : true;

const ToastNotification = () => {
  const dispatch = useDispatch();
  const [counter, setCounter] = useState(0);
  const notifications = useSelector(({ appModel }) => appModel.notifications);

  // Create a copy of notifications to avoid mutation
  const notificationsToShow = [...(notifications || [])].reverse();

  const removeNotification = (id) => {
    dispatch.appModel.removeNotification(id);
  };

  // Test function to add a notification
  const addTestNotification = () => {
    if (!debug) return;
    setCounter((prev) => prev + 1);
    dispatch.appModel.addNotification({
      title: `Playback error ${counter}`,
      description: `"The Solace System" by Epica could not be played.`,
      // duration: 999999999,
      duration: 3000,
    });
  };

  // Test function to add a notification on key press
  useEffect(() => {
    if (!debug) return;
    // add notification on key press for testing
    const handleKeyDown = (event) => {
      if (event.key === 'a') {
        event.preventDefault();
        addTestNotification();
      }
    };
    // add event listener for key press
    document.addEventListener('keydown', handleKeyDown);
    // remove event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  return (
    <>
      <RadixToast.Provider duration={3000}>
        {notificationsToShow?.map((notification) => (
          <RadixToast.Root
            key={notification.id}
            className={clsx(style.toast)}
            // duration={notification.duration}
            onOpenChange={(open) => {
              if (!open) removeNotification(notification.id);
            }}
            onPause={() => {
              console.log('Toast paused:', notification.id);
            }}
            onResume={() => {
              console.log('Toast resumed:', notification.id);
            }}
          >
            <div className={style.content}>
              <RadixToast.Title className={style.title}>
                {notification.id} - {notification.title}
              </RadixToast.Title>
              <RadixToast.Description className={style.description}>{notification.description}</RadixToast.Description>
            </div>
            <RadixToast.Close className={style.closeButton}>
              <span>&times;</span>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className={style.viewport} />
      </RadixToast.Provider>

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
