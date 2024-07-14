import React, { useEffect } from 'react';
import { showToast } from './Toast';

const Notifications = () => {

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/Notifications`);
        const data = await response.json();
        data.forEach(notification => showToast(notification.title,notification.message, notification.type));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div>
    </div>
  );
};

export default Notifications;
