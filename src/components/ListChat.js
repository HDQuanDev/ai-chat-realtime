import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UpgradePackage from './UpgradePackage';
import axios from 'axios';
import { showToast } from './Toast';
import { Click_Sound, Error_Sound } from './SoundEffects';
import Swal from 'sweetalert2';
import useDarkMode from './useDarkMode';

const ListChat = ({ isOpen, toggleChatList }) => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createdChat, setCreatedChat] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    } else if (localStorage.getItem('active_chat')) {
      setActiveChat(localStorage.getItem('active_chat'));
    }

    if (currentPath === '/' && localStorage.getItem('active_chat')) {
      navigate(`/topic/${localStorage.getItem('active_chat')}`);
    }


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
          } else if (response.code === 900) {
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredChats(chats);
    } else {
      setFilteredChats(
        chats.filter((chat) =>
          chat.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [chats, searchTerm]);

  const handleChatSelect = (chatCode) => {
    Click_Sound();
    setActiveChat(chatCode);
    localStorage.setItem('active_chat', chatCode.toString());
    navigate(`/topic/${chatCode}`);
  };

  const createTopic = async () => {
    Click_Sound();
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const isDarkMode = useDarkMode();

  var background, color;

  if(isDarkMode){
      background = '#555';
      color = '#f7f7f7';
  }else{
      background = '#ebebeb';
      color = '#333';
  }
  const handleDeleteChat = (chatCode) => {
    Click_Sound();
    // Hiển thị hộp thoại xác nhận
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa chủ đề chat này?',
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: 'warning',
      color: color,
      background: background,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        Click_Sound();
        // Gửi request đến API để kiểm tra ID
        fetch(`${process.env.REACT_APP_API_URL}/DeleteTopicChat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: chatCode }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            // Xóa chủ đề chat khỏi danh sách
            const updatedChats = chats.filter((chat) => chat.code !== chatCode);
            setChats(updatedChats);
            localStorage.setItem('chats', JSON.stringify(updatedChats));
            localStorage.removeItem('active_chat');
            // Chọn chủ đề chat hoạt động là chủ đề đầu tiên trong danh sách
            if (updatedChats.length > 0) {
              setActiveChat(updatedChats[0].code);
              localStorage.setItem('active_chat', updatedChats[0].code.toString());
              navigate(`/topic/${updatedChats[0].code}`);
            } else {
              setActiveChat(null);
              navigate('/');
            }
            showToast('Thành công!', 'Chủ đề chat đã được xóa.', 'success');
          } else {
            showToast('Lỗi!', 'Đã xảy ra lỗi khi xóa chủ đề chat này: ' + data.message, 'error');
          }
        })
        .catch(error => {
          Error_Sound();
          showToast('Lỗi!', 'Đã xảy ra lỗi khi xóa chủ đề chat này: ' + error.message, 'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Click_Sound();
        showToast('Hủy', 'Chủ đề chat không bị xóa', 'info');
      }
    });
  };
  

  return (
<div className={`
  fixed md:static top-0 left-0 h-full w-64 md:w-80 
  bg-white dark:bg-gray-800 text-gray-800 dark:text-white 
  shadow-lg transition-all duration-300 ease-in-out z-20 transform 
  ${isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'}
`}>
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-gray-700 dark:to-gray-800 text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Lịch sử trò chuyện</h2>
          <div className="flex space-x-2">
            <button onClick={createTopic} className="focus:outline-none hover:bg-blue-600 dark:hover:bg-gray-600 p-1 rounded-full transition-colors duration-200" title="Tạo chủ đề chat">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
            <button onClick={toggleChatList} className="focus:outline-none hover:bg-blue-600 dark:hover:bg-gray-600 p-1 rounded-full transition-colors duration-200">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}></path>
        </svg>
      </button>
          </div>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm chủ đề..."
            value={searchTerm}
            onChange={handleSearch}
            onClick={() => Click_Sound()}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 rounded-full text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
          />
          <svg className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-380px)] xl:h-[calc(100%-320px)] px-2">
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
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Tải lại trang
            </button>
          </div>
        )}
        {createdChat && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <svg className="w-12 h-12 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 18v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-500 mb-4">Bạn chưa có chủ đề chat nào. Hãy tạo chủ đề chat mới!</p>
            <button
              onClick={createTopic}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Tạo chủ đề chat mới
            </button>
          </div>        
        )}
{!loading && !error && (
  <ul className="space-y-2 mt-2">
    {filteredChats.map((chat) => (
      <li 
        key={chat.code} 
        className={`p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200
          ${activeChat === chat.code ? 'bg-blue-100 dark:bg-blue-900 shadow-md' : ''}
        `}
        onClick={() => handleChatSelect(chat.code)}
      >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-white font-bold">
            {chat.title.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{chat.title}</div>
            <div className="text-sm truncate text-gray-500 dark:text-gray-400">
              {chat.FirstMessage}
            </div>
          </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteChat(chat.code);
          }}
          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
          title="Xóa chủ đề chat"
        >
          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </li>
    ))}
  </ul>
)}
      </div>

      <UpgradePackage 
  onUpgrade={() => {
    Swal.fire({
      title: 'Ủng Hộ Tôi Qua QRCode',
      html: `
        <img src="https://img.vietqr.io/image/MB-0919982762-compact.png" class="mx-auto" />
        <p class="mt-2">Số Tài Khoản: 0919982762</p>
        <p>Chủ tài khoản: Hứa Đức Quân</p>
        <p>Ngân hàng: MB Bank</p>
      `,
      icon: 'info',
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#3085d6',
    }).then(() => {
      Click_Sound();
    });
  }} 
/>
    </div>
  );
};

export default ListChat;
