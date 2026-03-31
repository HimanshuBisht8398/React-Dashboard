import React, { useEffect } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { useStateContext } from '../contexts/ContextProvider';

const formatNotificationTime = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

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

  useEffect(() => {
    if (notifications.length > 0) {
      markNotificationsAsSeen();
    }
  }, [notifications, markNotificationsAsSeen]);

  return (
    <div className="nav-item absolute right-5 top-16 w-96 rounded-xl bg-white p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">Notifications</p>
          <p className="text-sm text-gray-500">Latest query entries from the API</p>
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
          {notificationsLoading ? 'Loading notifications...' : `${notifications.length} entries found`}
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
        {!notificationsLoading && notifications.length === 0 && !notificationsError && (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
            No new notifications yet.
          </div>
        )}
        {console.log("_+_+_+_+",notifications)}
        {notifications.map((notification) => (
          <div key={notification.id} className="mb-3 rounded-xl border border-gray-100 px-4 py-3 last:mb-0">
            <p className="text-sm font-medium text-gray-800">{notification.message}</p>
            <p className="mt-1 text-xs text-gray-500">{formatNotificationTime(notification.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
