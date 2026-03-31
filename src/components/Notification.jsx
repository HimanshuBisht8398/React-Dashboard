import React, { useEffect } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { useStateContext } from '../contexts/ContextProvider';

const MAX_VISIBLE_NOTIFICATIONS = 10;

const formatNotificationTime = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short',
  });
};

const getNotificationTimeValue = (value) => {
  if (!value) return 0;

  const parsedTime = new Date(value).getTime();
  return Number.isNaN(parsedTime) ? 0 : parsedTime;
};

const Notification = () => {
  const {
    currentColor,
    notifications,
    notificationsLoading,
    notificationsError,
    fetchNotifications,
    markNotificationsAsSeen,
    setIsClicked,
  } = useStateContext();

  const visibleNotifications = [...notifications]
    .sort((firstNotification, secondNotification) => (
      getNotificationTimeValue(secondNotification.createdAt)
      - getNotificationTimeValue(firstNotification.createdAt)
    ))
    .slice(0, MAX_VISIBLE_NOTIFICATIONS);

  useEffect(() => {
    if (visibleNotifications.length > 0) {
      markNotificationsAsSeen(visibleNotifications.map((notification) => notification.id));
    }
  }, [visibleNotifications, markNotificationsAsSeen]);

  return (
    <div className="nav-item absolute right-5 top-16 w-96 rounded-xl bg-white p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">Notifications</p>
          {/* <p className="text-sm text-gray-500">Latest query entries from the API</p> */}
        </div>
        <button
          type="button"
          onClick={() => setIsClicked((prevState) => ({ ...prevState, notification: false }))}
          className="rounded-full p-2 text-xl text-gray-500 hover:bg-light-gray"
        >
          <MdOutlineCancel />
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {notificationsLoading
            ? 'Loading notifications...'
            : `Showing ${visibleNotifications.length} latest of ${notifications.length} entries`}
        </span>
        <button
          type="button"
          onClick={fetchNotifications}
          className="rounded-lg px-3 py-2 text-sm text-white"
          style={{ backgroundColor: currentColor }}
        >
          Refresh
        </button>
      </div>

      {notificationsError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {notificationsError}
        </div>
      )}

      <div className="max-h-80 overflow-y-auto">
        {!notificationsLoading && visibleNotifications.length === 0 && !notificationsError && (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
            No new notifications yet.
          </div>
        )}
        {visibleNotifications.map((notification) => (
          <div key={notification.id} className="mb-3 rounded-xl border border-gray-100 px-4 py-3 last:mb-0">
            <p className="text-sm font-medium text-gray-800">{notification.message}</p>
            {formatNotificationTime(notification.createdAt) && (
              <p className="mt-1 text-xs text-gray-500">{formatNotificationTime(notification.createdAt)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
