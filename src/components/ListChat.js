import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UpgradePackage from './UpgradePackage';
import axios from 'axios';
import { showToast } from './Toast';
import Swal from 'sweetalert2';

const ListChat = ({ isOpen, toggleChatList }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createdChat, setCreatedChat] = useState(false);
  const [error, setError] = useState(null);
  const initialMessageShown = useRef(false);
  const eventSourceRef = useRef(null);
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const location = useLocation();
  const [isFirstLoad, setIsFirstLoad] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    const topicId = currentPath.split('/').pop();
    if (topicId !== null && topicId !== '') {
      setActiveChat(topicId);
    }else if (localStorage.getItem('active_chat')) {
      setActiveChat(localStorage.getItem('active_chat'));
    }

    if(currentPath === '/' && localStorage.getItem('active_chat')) {
      navigate(`/topic/${localStorage.getItem('active_chat')}`);
    }
    // console.log('Current Path:', currentPath);


    const chatId = localStorage.getItem('id_user');

    if (!chatId) {
      setLoading(false);
      return;
    }

    const timeoutDuration = 5 * 60 * 1000; // 5 minutes
    let timeoutId;

    const connectEventSource = () => {
      eventSourceRef.current = new EventSource(`${process.env.REACT_APP_API_URL}/SyncListChat?chat_id=${chatId}`);

      eventSourceRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.status === 'success') {
          if (response.code === 304 || response.code === 404) {
            const savedChats = JSON.parse(localStorage.getItem('chats') || '[]');
            if (savedChats.length > 0) {
              setChats(savedChats);
            } else {
              setError('No data available');
            }
          } else if(response.code === 900) {
            setCreatedChat(true);
            setError('Chưa có chủ đề chat nào, hãy tạo chủ đề chat mới');
          } else {
            setCreatedChat(false);
            const data = response.data;
            const formattedChats = data.map((item) => ({
              id: item.id,
              title: item.title || 'Unknown',
              code: item.code,
              FirstMessage: item.FirstMessage,
            }));

            if (!initialMessageShown.current) {
              initialMessageShown.current = true;
            }

            setChats(formattedChats);
            localStorage.setItem('chats', JSON.stringify(formattedChats));
          }
          setLoading(false);
          setError(null);
        } else {
          handleError('Lỗi khi lấy dữ liệu từ server: ' + response.message);
        }
      };

      eventSourceRef.current.onerror = () => {
        handleError('Lỗi kết nối, vui lòng tải lại trang để thử lại');

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };

      timeoutId = setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          connectEventSource();
        }
      }, timeoutDuration);
    };

    const handleError = (errorMessage) => {
      console.error('Error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      if (eventSourceRef.current) eventSourceRef.current.close();
      
      // Sử dụng dữ liệu từ localStorage khi có lỗi
      const savedChats = JSON.parse(localStorage.getItem('chats') || '[]');
      setChats(savedChats);
    };

    connectEventSource();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleChatSelect = (chatCode) => {
    setActiveChat(chatCode);
    localStorage.setItem('active_chat', chatCode.toString());
    navigate(`/topic/${chatCode}`);
  };

  const createTopic = async () => {
    const chatId = localStorage.getItem('id_user');
    setIsFirstLoad(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/CreateTopicChat`, { chat_id: chatId });
      if (response.data.status === 'success') {
        showToast('Thành công', 'Đã tạo chủ đề chat mới', 'success');
        setIsFirstLoad(false);
      } else {
        throw new Error('Failed to register Chat');
      }
    } catch (error) {
      console.error('Error registering ID:', error);
      showToast('Lỗi', 'Có lỗi xảy ra khi tạo chủ đề chat. Vui lòng thử lại.', 'error');
    }
  };

  return (
    <div className={`
      fixed md:static top-0 left-0 h-full w-64 md:w-80 
      bg-white dark:bg-gray-800 text-gray-800 dark:text-white 
      shadow-lg transition-transform duration-300 ease-in-out z-20
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'}
    `}>
      <div className="p-3 bg-blue-500 dark:bg-gray-700 text-white flex justify-between items-center">
        <h2 className="font-bold">Lịch sử trò chuyện</h2><hr/>
        {/* create topic chat */}
        <button onClick={createTopic} className="focus:outline-none" title="Tạo chủ đề chat">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </button>
        <button onClick={toggleChatList} className="focus:outline-none">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}></path>
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100%-250px)] xl:h-[calc(100%-200px)]">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-2 text-gray-600 dark:text-gray-400">Đang kết nối...</p>
          </div>
        )}
        {isFirstLoad && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-2 text-gray-600 dark:text-gray-400">Đang tạo chủ đề chat...</p>
            </div>
            )}
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              Tải lại trang
            </button>
          </div>
        )}
        {createdChat && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <svg
            className="w-12 h-12 text-blue-500 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 18v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-blue-500 mb-4">Bạn chưa có chủ đề chat nào, hãy tạo chủ đề chat mới bằng cách nhấn vào nút + ở phía trên hoặc nhấn vào nút bên dưới để tạo chủ đề chat mới</p>
          <button
            onClick={createTopic}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
          >
            Tạo chủ đề chat mới
          </button>
        </div>        
        )}
        {!loading && !error && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {chats.map((chat) => (
              <li 
                key={chat.code} 
                className={`p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                  ${activeChat === chat.code  ? 'bg-blue-100 dark:bg-blue-900' : ''}
                `}
                onClick={() => handleChatSelect(chat.code)}
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  {chat.title.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{chat.title}</div>
                  <div className="text-sm truncate text-gray-500 dark:text-gray-400">
                    {chat.FirstMessage}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <UpgradePackage 
  onUpgrade={() => Swal.fire({
    title: 'Ủng Hộ Tôi Qua QRCode',
    html: `
      <img src="https://img.vietqr.io/image/MB-0919982762-compact.png" class="mx-auto" />
      <p>Số Tài Khoản: 0919982762</p>
      <p>Chủ tài khoản: Hứa Đức Quân</p>
      <p>Ngân hàng: MB Bank</p>
    `,
    icon: 'info'
  })} 
/>
    </div>
  );
};

export default ListChat;
