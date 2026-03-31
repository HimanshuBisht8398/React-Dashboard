import React , {createContext, useCallback, useContext, useEffect, useState} from "react";

const StateContext = createContext();
const ADMIN_LOGIN_API_URL = 'https://hihillsbackend-production.up.railway.app/admin/login';
const NOTIFICATIONS_API_URL = 'https://hihillsbackend-production.up.railway.app/notifications';
const SEEN_NOTIFICATIONS_STORAGE_KEY = 'seenNotificationIds';

const initialState = {
    chat:false,
    cart:false,
    userProfile:false,
    notification:false
}

const getNotificationList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.notifications)) return payload.notifications;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.notifications)) return payload.data.notifications;
    return [];
};

const buildNotificationMessage = (notification) => {
    const customerName = notification?.name
        || notification?.customerName
        || notification?.fullName
        || notification?.customer?.name
        || notification?.user?.name
        || notification?.query?.name
        || 'Unknown';

    return `Query received from name ${customerName}`;
};

const normalizeDateValue = (value) => {
    if (!value) {
        return '';
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? '' : value.toISOString();
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return '';
        }

        const parsedDate = new Date(trimmedValue);
        return Number.isNaN(parsedDate.getTime()) ? trimmedValue : parsedDate.toISOString();
    }

    if (typeof value === 'number') {
        const timestamp = value > 1e12 ? value : value * 1000;
        const parsedDate = new Date(timestamp);
        return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString();
    }

    if (typeof value === 'object') {
        if (typeof value.toDate === 'function') {
            return normalizeDateValue(value.toDate());
        }

        if ('$date' in value) {
            return normalizeDateValue(value.$date);
        }

        if ('seconds' in value) {
            return normalizeDateValue(value.seconds);
        }

        if ('_seconds' in value) {
            return normalizeDateValue(value._seconds);
        }

        if ('value' in value) {
            return normalizeDateValue(value.value);
        }
    }

    return '';
};

const getObjectIdTimestamp = (value) => {
    const objectId = typeof value === 'string'
        ? value
        : value?.$oid || value?.oid || '';

    if (typeof objectId !== 'string' || !/^[a-f\d]{24}$/i.test(objectId)) {
        return '';
    }

    const timestamp = Number.parseInt(objectId.slice(0, 8), 16) * 1000;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const getNotificationTimestamp = (notification) => {
    const directTimestamp = normalizeDateValue(notification);
    if (directTimestamp) {
        return directTimestamp;
    }

    const candidateValues = [
        notification?.createdAt,
        notification?.created_at,
        notification?.submittedAt,
        notification?.submitted_at,
        notification?.timestamp,
        notification?.date,
        notification?.query?.createdAt,
        notification?.query?.created_at,
        notification?.query?.timestamp,
        notification?.customer?.createdAt,
        notification?.updatedAt,
        notification?.updated_at,
    ];

    for (const candidateValue of candidateValues) {
        const resolvedTimestamp = normalizeDateValue(candidateValue);
        if (resolvedTimestamp) {
            return resolvedTimestamp;
        }
    }

    return getObjectIdTimestamp(notification?._id) || getObjectIdTimestamp(notification?.id);
};
const normalizeNotifications = (payload) => getNotificationList(payload).map((notification, index) => ({

    id: notification?._id || notification?.id || `${getNotificationTimestamp(notification) || 'notification'}-${index}`,
    message: buildNotificationMessage(notification),
    createdAt: getNotificationTimestamp(notification),
    read: Boolean(notification?.read),
}));

export const ContextProvider = ({children}) =>{
    const [activeMenu, setActiveMenu] = useState(true);
    const [isClicked, setIsClicked] = useState(initialState);
    const [screenSize, setScreenSize] = useState(undefined);
    const [currentColor, setCurrentColor] = useState('#03C9D7');
    const [currentMode, setCurrentMode] = useState('Light');
    const [themeSettings, setThemeSettings] = useState(false); // right sidebar open or close
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    });
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || '');

    const isAuthenticated = !!accessToken;

    // Toast state
    const [toasts, setToasts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState('');
    const [seenNotificationIds, setSeenNotificationIds] = useState(() => {
        try {
            const raw = localStorage.getItem(SEEN_NOTIFICATIONS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            return [];
        }
    });

    const showToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const toast = { id, message, type };
        setToasts((t) => [...t, toast]);
        setTimeout(() => {
            setToasts((t) => t.filter((x) => x.id !== id));
        }, duration);
        return id;
    };

    const removeToast = (id) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    };

    const markNotificationsAsSeen = useCallback((notificationIds = []) => {
        const idsToMark = notificationIds.length > 0 ? notificationIds : notifications.map((notification) => notification.id);

        if (idsToMark.length === 0) {
            return;
        }

        setSeenNotificationIds((previousIds) => {
            const updatedIds = [...new Set([...previousIds, ...idsToMark])];
            if (updatedIds.length === previousIds.length) {
                return previousIds;
            }
            localStorage.setItem(SEEN_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedIds));
            return updatedIds;
        });
    }, [notifications]);

    const fetchNotifications = useCallback(async () => {
        const storedAccessToken = localStorage.getItem('accessToken') || accessToken;

        if (!storedAccessToken) {
            setNotifications([]);
            return;
        }

        try {
            setNotificationsLoading(true);
            setNotificationsError('');

            const response = await fetch(NOTIFICATIONS_API_URL, {
                headers: {
                    Authorization: `Bearer ${storedAccessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || `Notifications request failed with status ${response.status}`);
            }

            setNotifications(normalizeNotifications(data));
        } catch (error) {
            setNotificationsError(error.message || 'Unable to load notifications');
        } finally {
            setNotificationsLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken) {
            setNotifications([]);
            setNotificationsError('');
            setSeenNotificationIds([]);
            localStorage.removeItem(SEEN_NOTIFICATIONS_STORAGE_KEY);
            return undefined;
        }

        fetchNotifications();
        const intervalId = window.setInterval(fetchNotifications, 30000);

        return () => window.clearInterval(intervalId);
    }, [accessToken, fetchNotifications]);

    const unreadNotificationCount = notifications.filter((notification) => !seenNotificationIds.includes(notification.id)).length;

    const login = async ({ email, password }) => {
        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        try {
            const response = await fetch(ADMIN_LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Login failed with status ${response.status}`,
                };
            }

            const token = data.accessToken || data.token || data.access_token;
            if (!token) {
                return { success: false, message: 'Login succeeded but no access token was returned' };
            }

            const userObj = data.user || { email };
            setUser(userObj);
            setAccessToken(token);
            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('accessToken', token);

            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Unable to login right now',
            };
        }
    };

    const logout = () => {
        setUser(null);
        setAccessToken('');
        setNotifications([]);
        setNotificationsError('');
        setSeenNotificationIds([]);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem(SEEN_NOTIFICATIONS_STORAGE_KEY);
    };

    const setMode = (e) =>{
        setCurrentMode(e.target.value);

        //when user come next time, still the previous mode is active
        localStorage.setItem('themeMode',e.target.value);
        setThemeSettings(false);
    }

    const setColor = (color) =>{
        setCurrentColor(color);

        //when user come next time, still the previous mode is active
        localStorage.setItem('colorMode',color);
        setThemeSettings(false);
    }

    const handleClick = (clicked) =>{
        setIsClicked({...initialState,[clicked]:true});// only change the value that has been clicked, set it to true
    }
    return (
        <StateContext.Provider value={{
           activeMenu,
           setActiveMenu,
           isClicked,
           setIsClicked,
           handleClick,
           screenSize,
           setScreenSize,
           currentColor,
           currentMode,
           setColor,
           setMode,
           themeSettings,
           setThemeSettings
           ,
           // auth
           user,
           accessToken,
           isAuthenticated,
           login,
           logout,
           notifications,
           notificationsLoading,
           notificationsError,
           unreadNotificationCount,
           fetchNotifications,
           markNotificationsAsSeen,
           // toast
           toasts,
           showToast,
           removeToast
        }}>
            {children}
        </StateContext.Provider>
    )
};

export const useStateContext = () => useContext(StateContext);
