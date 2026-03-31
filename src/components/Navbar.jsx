import React, { useEffect } from 'react';
import {AiOutlineMenu} from 'react-icons/ai';
import {RiNotification3Line} from 'react-icons/ri';
import {MdKeyboardArrowDown} from 'react-icons/md';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useNavigate } from 'react-router-dom';

import {Cart, Chat, Notification} from '.';
import { useStateContext } from '../contexts/ContextProvider';

const NavButton = ({title, customFunc, icon, color, dotColor, count})=>(
  <TooltipComponent content={title} position='BottomCenter'>
    <button type='button' onClick={customFunc} style={{color}} className='relative text-xl
     rounded-full p-3 hover:bg-light-gray'>
      {dotColor && (
        <span style={{background: dotColor}} className='absolute inline-flex rounded-full h-2 w-2 right-2 top-2'/>
      )}
      {count > 0 && (
        <span className='absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white'>
          {count > 99 ? '99+' : count}
        </span>
      )}
  	    {icon}  
    </button>
  </TooltipComponent>
);

const Navbar = () => {
  const navigate = useNavigate();
  const {
    activeMenu,
    setActiveMenu,
    isClicked,
    handleClick,
    screenSize,
    setScreenSize,
    currentColor,
    logout,
    unreadNotificationCount,
    fetchNotifications,
  } = useStateContext();

  useEffect(()=>{
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize',handleResize);
  },[]);

  useEffect(()=>{
    if(screenSize<=900){
      setActiveMenu(false);
    }else{
      setActiveMenu(true);
    }
  },[screenSize])

  return (
    <div className='flex justify-between p-2 md:mx-6 relative'>
      <NavButton title="Menu" customFunc={()=> setActiveMenu((prevActiveMenu)=> !prevActiveMenu)} color={currentColor} icon={<AiOutlineMenu/>}/>
      <div className='flex'>
      {/* <NavButton title="Cart" customFunc={()=> handleClick('cart')} color={currentColor} icon={<FiShoppingCart/>}/> */}
      {/* <NavButton title="Chat" dotColor="#03C9D7" customFunc={()=> handleClick('chat')} color={currentColor} icon={<BsChatLeft/>}/> */}
      <NavButton
        title=""
        dotColor={unreadNotificationCount > 0 ? '#03C9D7' : undefined}
        customFunc={() => {
          handleClick('notification');
          fetchNotifications();
        }}
        color={currentColor}
        icon={<RiNotification3Line/>}
        count={unreadNotificationCount}
      />
      <TooltipComponent content="Profile" position='BottomCenter'>
        <div className='flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg'
        onClick={()=> handleClick('userProfile')}>

          <MdKeyboardArrowDown className='text-gray-400 text-14'/>
          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
              navigate('/login');
            }}
            className='ml-3 text-sm px-2 py-1 bg-red-500 text-white rounded'>
            Logout
          </button>
        </div>
      </TooltipComponent>
      {isClicked.cart && <Cart/>}
      {isClicked.chat && <Chat/>}
      {isClicked.notification && <Notification/>}
      {/* {isClicked.userProfile && <UserProfile/>} */}
      </div>
    </div>
  )
}

export default Navbar
