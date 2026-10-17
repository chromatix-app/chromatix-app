import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'sonner';
import clsx from 'clsx';

import style from './ToastNotification.module.scss';

const isProduction = import.meta.env.VITE_ENV === 'production';
const defaultDuration = 6000;

const ToastNotification = () => {
  const dispatch = useDispatch();
  const [isHovering, setIsHovering] = useState(false);
  const notifications = useSelector(({ appModel }) => appModel.notifications);

  // Effect to show notifications from Redux store
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Get the latest notification
    const latestNotification = notifications[notifications.length - 1];

    // Show it with Sonner
    if (!latestNotification.debug || !isProduction) {
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

  return (
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
      />
    </div>
  );
};

export default ToastNotification;
