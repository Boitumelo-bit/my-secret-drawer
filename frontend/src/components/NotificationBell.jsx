import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../context/NotificationContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'promotion': return '🎉';
      case 'alert': return '⚠️';
      default: return '📢';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative text-[#1A1A1A] hover:text-[#FF1493] transition-colors flex items-center justify-center p-1.5 rounded-full active:scale-95"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#FF1493] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown - Full width on mobile */}
          <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 md:w-96 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-100">
              <h3 className="font-semibold text-[#1A1A1A] text-sm sm:text-base">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-xs text-[#FF1493] hover:text-[#FF69B4] transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BellIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-[#FFF0F5] transition-colors cursor-pointer ${
                      !notif.read ? 'bg-[#FFF0F5]/50' : ''
                    }`} 
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-lg sm:text-xl shrink-0">{getTypeIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-xs sm:text-sm text-[#1A1A1A] break-words flex-1">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] sm:text-xs text-gray-400 shrink-0">
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FF1493] rounded-full mt-2 shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;