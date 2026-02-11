import React , {createContext, useContext, useState} from "react";

const StateContext = createContext();

const initialState = {
    chat:false,
    cart:false,
    userProfile:false,
    notification:false
}

export const ContextProvider = ({children}) =>{
    const [activeMenu, setActiveMenu] = useState(true);
    const [isClicked, setIsClicked] = useState(initialState);
    const [screenSize, setScreenSize] = useState(undefined);
    const [currentColor, setCurrentColor] = useState('#03C9D7');
    const [currentMode, setCurrentMode] = useState('Light');
    const [themeSettings, setThemeSettings] = useState(false); // right sidebar open or close
    // simple auth state: user is null when not authenticated
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    });

    const isAuthenticated = !!user;

    // demo login: accepts username 'admin' and password 'admin123'
    const login = async ({ username, password }) => {
        // In a real app you'd call an API here. This is a simple placeholder.
        if (!username || !password) {
            return { success: false, message: 'Username and password are required' };
        }

        if (username === 'admin' && password === 'admin123') {
            const userObj = { username };
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            return { success: true };
        }

        return { success: false, message: 'Invalid credentials' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
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
           isAuthenticated,
           login,
           logout
        }}>
            {children}
        </StateContext.Provider>
    )
};

export const useStateContext = () => useContext(StateContext);