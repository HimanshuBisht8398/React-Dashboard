import React , {useEffect} from 'react';
import {Navbar, Footer, Sidebar, ThemeSettings} from './components';
import {Ecommerce, Orders, Calendar, Employees, Stacked, Pyramid, Customers, Kanban, Area, 
Bar, Pie, Financial, ColorMapping, ColorPicker, Editor, Line, Login} from './pages';
import RequireAuth from './components/RequireAuth';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {FiSettings} from 'react-icons/fi';
import {TooltipComponent} from '@syncfusion/ej2-react-popups';
import {useStateContext} from './contexts/ContextProvider'

const App = () => {

    const {activeMenu, themeSettings, setThemeSettings, currentColor, currentMode, isAuthenticated} = useStateContext();
   
  return (
    <div className={currentMode === 'Dark' ? 'dark': ''}>
        <BrowserRouter>
            <div className='flex relative dark:bg-main-dark-bg'>
                {isAuthenticated && (
                    <div className='fixed right-4 bottom-4' style={{zIndex:'1000'}}>
                        <TooltipComponent content="Settings" position='Top'>
                            <button type='button' 
                            className='text-3xl p-3 hover:drop-shadow-xl
                             hover:bg-light-gray text-white' onClick={()=> setThemeSettings(true)}
                             style={{background: currentColor, borderRadius: '50%'}}>
                                <FiSettings/>
                            </button>
                        </TooltipComponent> 
                    </div>
                )}

                {isAuthenticated && (activeMenu ? (
                    <div className='w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white'>
                        <Sidebar/>
                    </div>
                ) : (
                    <div className='w-0 dark:bg-secondary-dark-bg'>
                        <Sidebar/>
                    </div>
                ))}

                <div className={ `dark:bg-main-dark-bg bg-main-bg min-h-screen w-full ${(isAuthenticated && activeMenu) ?
                     ' md:ml-72' 
                     :'flex-2'}`
                    }>
                {isAuthenticated && (
                  <div className='fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full'>
                      <Navbar/>
                  </div>
                )}

                {isAuthenticated && themeSettings && <ThemeSettings/>}

                <div>
                    <Routes>
                        {/* Public */}
                        <Route path="/login" element={<Login/>} />

                        {/* Protected Dashboard */}
                        <Route path="/" element={<RequireAuth><Ecommerce/></RequireAuth>} />
                        <Route path="/ecommerce" element={<RequireAuth><Ecommerce/></RequireAuth>} />

                        {/* Pages */}
                        <Route path="/orders" element={<RequireAuth><Orders/></RequireAuth>} />
                        <Route path="/employees" element={<RequireAuth><Employees/></RequireAuth>} />
                        <Route path="/customers" element={<RequireAuth><Customers/></RequireAuth>} />

                        {/* Apps */}
                        <Route path="/kanban" element={<RequireAuth><Kanban/></RequireAuth>} />
                        <Route path="/editor" element={<RequireAuth><Editor/></RequireAuth>} />
                        <Route path="/calendar" element={<RequireAuth><Calendar/></RequireAuth>} />
                        <Route path="/color-picker" element={<RequireAuth><ColorPicker/></RequireAuth>} />

                        {/* Charts */}
                        <Route path="/line" element={<RequireAuth><Line/></RequireAuth>} />
                        <Route path="/area" element={<RequireAuth><Area/></RequireAuth>} />
                        <Route path="/bar" element={<RequireAuth><Bar/></RequireAuth>} />
                        <Route path="/pie" element={<RequireAuth><Pie/></RequireAuth>} />
                        <Route path="/financial" element={<RequireAuth><Financial/></RequireAuth>} />
                        <Route path="/color-mapping" element={<RequireAuth><ColorMapping/></RequireAuth>} />
                        <Route path="/pyramid" element={<RequireAuth><Pyramid/></RequireAuth>} />
                        <Route path="/stacked" element={<RequireAuth><Stacked/></RequireAuth>} />
                    </Routes>
                </div>
            </div>
            </div>
        </BrowserRouter>
    </div>
  )
}

export default App