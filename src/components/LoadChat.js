import React, { useEffect, useState, useRef } from 'react';
import { showToast } from './Toast';

const LoadChat = ({ setMessageHistory }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialMessageShown = useRef(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const chatId = localStorage.getItem('id_user');

    if (!chatId) {
      setLoading(false);
      return; // Không làm gì nếu không có id_user
    }

    const timeoutDuration = 5 * 60 * 1000; // 5 minutes
    let timeoutId;

    const connectEventSource = () => {
      eventSourceRef.current = new EventSource(`${process.env.REACT_APP_API_URL}/SyncData?chat_id=${chatId}`);

      eventSourceRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.status === 'success') {
          if (response.code === 304) {
            console.log('No updates');
          } else if (response.code === 404) {
            console.log('No data available');

            // Clear local storage id_user
            localStorage.removeItem('id_user');
          } else {
            const data = response.data;

            const formattedMessages = data.map((item) => ({
              sender: item.sender === 'user' ? 'user' : 'ai',
              image_url: item.file_url,
              text_display: item.message,
            }));

            const json = JSON.stringify(formattedMessages);
            const data_goc = localStorage.getItem('messageHistorySave');

            if (!initialMessageShown.current) {
              showToast('Thành công', 'Đã kết nối thành công với máy chủ', 'success');
              initialMessageShown.current = true;
            }

            if (!data_goc || json.length !== data_goc.length) {
              localStorage.setItem('messageHistorySave', json);
              setMessageHistory(formattedMessages);
            }
          }
          setLoading(false);
        } else {
          handleError('Lỗi khi lấy dữ liệu từ server: ' + response.message);
          if(response.code === 404){
            localStorage.removeItem('id_user');
            localStorage.removeItem('messageHistorySave');
          }
        }
      };

      eventSourceRef.current.onerror = () => {
        handleError('Lỗi kết nối, vui lòng tải lại trang để thử lại');

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };

      // Set a timeout to disconnect and reconnect the EventSource after the specified duration
      timeoutId = setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          connectEventSource(); // Reconnect after timeout
        }
      }, timeoutDuration);
    };

    const handleError = (errorMessage) => {
      setError(errorMessage);
      setLoading(false);
      showToast('Lỗi', errorMessage, 'error');
      if (eventSourceRef.current) eventSourceRef.current.close();
    };

    connectEventSource();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      clearTimeout(timeoutId);
    };
  }, [setMessageHistory]);

  if (!localStorage.getItem('id_user')) {
    return null; // Không render gì nếu không có id_user
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-50">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">Đang kết nối với máy chủ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-50">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg text-center max-w-sm">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadChat;
