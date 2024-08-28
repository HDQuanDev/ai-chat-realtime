import React, { useState, useEffect, useRef } from 'react';
import { getDataFromLocalStorage, setDataToLocalStorage } from './Utils';
import { On_Off_Sound, Click_Sound } from './SoundEffects';
import 'tailwindcss/tailwind.css';
import Swal from 'sweetalert2';
import useDarkMode from './useDarkMode';

const SettingsModal = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleDarkMode,
  isSoundEffect,
  toggleSoundEffect,
  selectedModel,
  setSelectedModel,
  deleteAllMessage,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [chatId, setChatId] = useState('');
  const isDarkMode2 = useDarkMode();

  var background, color;

  if(isDarkMode2){
      background = '#555';
      color = '#f7f7f7';
  }else{
      background = '#ebebeb';
      color = '#333';
  }

  useEffect(() => {
    switch (selectedModel) {
      case 'gemini-1.5-pro-exp-0801':
        setDisplayText('Mô hình đa phương thức cỡ trung mạnh mẽ, hiệu suất vượt trội và mới nhất hỗ trợ lên đến 2 triệu token.');
        break;
      case 'gemini-1.5-pro-exp-0827':
        setDisplayText('Mô hình đa phương thức, bản nâng cấp thứ 2 của Gemini 1.5 Pro Experimental 0801, hỗ trợ lên đến 2 triệu token.');
        break;
      case 'gemini-1.5-flash-latest':
        setDisplayText('Mô hình đa phương thức mới nhất nhanh chóng và linh hoạt để mở rộng quy mô cho các nhiệm vụ đa dạng');
        break;
      case 'gemini-1.5-flash':
        setDisplayText('Mô hình đa phương thức nhanh chóng và linh hoạt để mở rộng quy mô cho các nhiệm vụ đa dạng');
        break;
      case 'gemini-1.5-flash-exp-0827':
        setDisplayText('Mô hình đa phương thức nhanh chóng và linh hoạt để mở rộng quy mô cho các nhiệm vụ đa dạng, là bản nâng cấp thứ 2 của Gemini 1.5 Flash. Hỗ trợ lên đến 1 triệu token.');
        break;
      case 'gemini-1.5-flash-8b-exp-0827':
        setDisplayText('Mô hình đa phương thức nhẹ nhàng và linh hoạt để mở rộng quy mô cho các nhiệm vụ đa dạng. Hỗ trợ lên đến 1 triệu token.');
        break;
      case 'gemini-1.5-pro':
        setDisplayText('Mô hình đa phương thức cỡ trung hỗ trợ tới 2 triệu token');
        break;
      case 'gemini-1.5-pro-latest':
        setDisplayText('Mô hình đa phương thức cỡ trung hỗ trợ tới 2 triệu token mới nhất');
        break;
      default:
        setDisplayText('');
    }

    const savedChatId = getDataFromLocalStorage('id_user') || 'Chưa đăng ký!!';
    setChatId(savedChatId);
  }, [selectedModel]);

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleDeleteAllMessages = () => {
    deleteAllMessage();
  };

  const handleCopyChatId = () => {
    Click_Sound();
    navigator.clipboard.writeText(chatId);
    Swal.fire({
      title: 'Đã sao chép!',
      text: 'ID Chat đã được sao chép vào clipboard.',
      icon: 'success',
      color: color,
      background: background,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleUpdateChatId = () => {
    Click_Sound();
    Swal.fire({
      title: 'Cập nhật ID Chat',
      input: 'text',
      inputValue: chatId,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy',
      color: color,
      background: background,
      inputValidator: (value) => {
        if (!value) {
          return 'Vui lòng nhập ID Chat!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Click_Sound();
        // Gửi request đến API để kiểm tra ID
        fetch(`${process.env.REACT_APP_API_URL}/CheckChatExist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chat_id: result.value }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            setChatId(result.value);
            setDataToLocalStorage('id_user', result.value);
            Swal.fire('Đã cập nhật!', 'ID Chat đã được cập nhật.', 'success');
            window.location.reload(true);
          } else {
            Swal.fire('Lỗi!', 'ID Chat không hợp lệ.', 'error');
          }
        })
        .catch(error => {
          Click_Sound();
          Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi kiểm tra ID.', 'error');
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4 overflow-y-auto">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl transition-colors duration-300 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cài Đặt</h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
  
        <SettingsTabs />
  
        <p className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400">
  Developed by <a href="https://www.facebook.com/quancp72h" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 no-underline" rel="noreferrer">Hứa Đức Quân</a>. View the source code on <a href="https://github.com/HDQuanDev/ai-chat-realtime" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 no-underline" rel="noreferrer">GitHub</a>.
</p>

      </div>
    </div>
  );
  
  function SettingsTabs() {
    const [activeTab, setActiveTab] = useState('general');
    const handleTabChange = (tab) => {
      setActiveTab(tab);
      Click_Sound();
    };
    const tabs = [
      { id: 'general', label: 'Chung', icon: '⚙️' },
      { id: 'model', label: 'Model', icon: '🤖' },
      { id: 'chat', label: 'Chat', icon: '💬' },
      { id: 'about', label: 'Thông tin', icon: 'ℹ️' },
    ];
  
    return (
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 mb-4 md:mb-0 md:border-r md:border-gray-200 md:dark:border-gray-700 md:pr-4">
          <div className="flex flex-wrap md:flex-col overflow-x-auto md:overflow-x-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-grow md:flex-grow-0 md:w-full text-center md:text-left py-2 px-3 md:py-3 md:px-4 mb-2 mr-2 md:mr-0 font-medium text-sm focus:outline-none rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="hidden md:inline mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
  
        <div className="w-full md:w-3/4 md:pl-6">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'model' && <ModelSettings />}
          {activeTab === 'chat' && <ChatSettings />}
          {activeTab === 'about' && <AboutSettings />}
        </div>
      </div>
    );
  }
  
  function GeneralSettings() {
    return (
      <>
        <div className="flex items-center justify-between transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
          <span className="text-gray-700 dark:text-white font-medium">Chế Độ Tối</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode}/>
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{isDarkMode ? 'Bật' : 'Tắt'}</span>
          </label>
        </div>
  
        <div className="flex items-center justify-between transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
          <span className="text-gray-700 dark:text-white font-medium">Hiệu Ứng Âm Thanh</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isSoundEffect} onChange={toggleSoundEffect}/>
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">{isSoundEffect ? 'Bật' : 'Tắt'}</span>
          </label>
        </div>
      </>
    );
  }
  
  function ModelSettings() {
    return (
      <div className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
                <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-white transition-colors duration-200">
          <p><span className="font-bold text-blue-500 dark:text-blue-400">Bảng Xếp Hạng:</span> Bạn có thể xem bảng xếp hạng của các mô hình tại <a href="https://lmarena.ai/" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 no-underline" rel="noreferrer">LM Arena</a>.</p>
        </div>
        <label htmlFor="model-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">Language Model</label>
        <select 
  id="model-select" 
  value={selectedModel} 
  onChange={handleModelChange}
  onClick={() => Click_Sound()}
  className="w-full p-2 md:p-3 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
>
          <option value="gemini-1.5-pro-exp-0827">Gemini 1.5 Pro Experimental 0827</option>
          <option value="gemini-1.5-pro-exp-0801">Gemini 1.5 Pro Experimental 0801</option>
          <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash Latest</option>
          <option value="gemini-1.5-flash-exp-0827">Gemini 1.5 Flash Experimental 0827</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          <option value="gemini-1.5-flash-8b-exp-0827">Gemini 1.5 Flash 8B Experimental 0827</option>
          <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro Latest</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
        </select>
        <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-white transition-colors duration-200">
          <p><span className="font-bold text-blue-500 dark:text-blue-400">Mô Tả:</span> {displayText}</p>
        </div>
        <div className="mt-2 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-white transition-colors duration-200">
        <p>
          <span className="font-bold text-blue-500 dark:text-blue-400">
            Mô hình đang sử dụng:
          </span>{" "}
          {selectedModel}
        </p>
      </div>
      </div>
    );
  }
  
  function ChatSettings() {
    return (
      <>
        <div className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-4 rounded-lg">
          <label htmlFor="chat-id" className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">ID Chat</label>
          <input 
            type="text" 
            id="chat-id" 
            value={chatId} 
            readOnly 
            className="w-full p-2 md:p-3 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 mb-2"
          />
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={handleCopyChatId}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Copy
            </button>
            <button 
              onClick={handleUpdateChatId}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cập nhật
            </button>
          </div>
        </div>
  
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-white transition-colors duration-200 mt-4">
          <p><span className="font-bold text-blue-500 dark:text-blue-400">Lưu Ý:</span> ID Chat được sử dụng để xác định người dùng và lưu trữ dữ liệu chat. Bạn có thể sử dụng ID này để đồng bộ dữ liệu chat giữa các thiết bị.<br/>Để cập nhật ID Chat hãy nhấn vào nút "Cập nhật" và nhập ID Chat được cung cấp từ thiết bị muốn đồng bộ dữ liệu chat.</p>
        </div>
  
        <div className="text-center mt-6">
          <button 
            onClick={handleDeleteAllMessages} 
            className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-all duration-200 text-sm font-medium transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
          >
            🗑️ Xóa Toàn Bộ Tin Nhắn
          </button>
        </div>
      </>
    );
  }
  
  function AboutSettings() {
    return (
<div className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg">
  <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4">Nhật Ký Thay Đổi Phiên Bản 1.4.1</h2>
  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
  <li>🎉 Thêm chức dừng tin nhắn đang phản hồi của máy chủ</li>
  <li>🎉 Tối ưu hoá giao diện MarkDown khi chuyển đổi qua Tailwind</li>
  <li>🎉 Cải thiện hiệu suất & Sửa các lỗi vặt đã biết trước đó</li>
  <li>🎉 Cập nhật mô hình mới nhất cho ứng dụng</li>
  </ul>
  <span className="block mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">Phiên bản 1.4.1 - © 29/08/2024 By Hứa Đức Quân</span>
</div>

    );
  }
};

const SettingsButton = ({deleteAllMessage}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSoundEffect, setIsSoundEffect] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash-latest');

  useEffect(() => {
    const darkMode = getDataFromLocalStorage('dark-mode');
    setIsDarkMode(darkMode);
    const soundEffects = getDataFromLocalStorage('sound-effects');
    setIsSoundEffect(soundEffects);
    const savedModel = getDataFromLocalStorage('model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  useEffect(() => {
    setDataToLocalStorage('dark-mode', isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setDataToLocalStorage('sound-effects', isSoundEffect);
  }, [isSoundEffect]);


  useEffect(() => {
    setDataToLocalStorage('model', selectedModel);
  }, [selectedModel]);

  const toggleSoundEffect = () => {
    setIsSoundEffect(prevMode => {
      On_Off_Sound();
      return !prevMode;
    });
  };

  const openModal = () => {
    Click_Sound();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    Click_Sound();
    setIsModalOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      On_Off_Sound();
      return !prevMode;
    });
  };

  return (
    <div>
      <button 
        className="fixed top-4 right-4 lg:right-8 xl:right-8 bg-gray-800 hover:bg-gray-900 text-black px-2 py-1 rounded-md z-50 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-black transition-colors duration-200"
        onClick={openModal} 
        title='Cài đặt' 
        alt='Cài đặt'
      >
        ⚙️
      </button>
      {isModalOpen && (
        <SettingsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isSoundEffect={isSoundEffect}
          toggleSoundEffect={toggleSoundEffect}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          deleteAllMessage={deleteAllMessage}
        />
      )}
    </div>
  );
};

export default SettingsButton;
