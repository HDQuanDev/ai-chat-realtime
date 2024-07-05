// setting.js
import React, { useContext, useState, useEffect } from 'react';
import { MessageContext } from './MessageContext';
import { getDataFromLocalStorage, setDataToLocalStorage } from './Utils';
import {  On_Off_Sound, Success_Sound, Click_Sound, Error_Sound } from './SoundEffects';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showToast } from './Toast';
import '../setting.css';

const SettingsModal = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleDarkMode,
  isSoundEffect,
  toggleSoundEffect,
  selectedModel,
  setSelectedModel
}) => {
  const [displayText, setDisplayText] = useState('');
  const { messageHistory, deleteAllMessages } = useContext(MessageContext);

  useEffect(() => {
    if (selectedModel === 'gemini-1.5-flash-latest') {
      setDisplayText('Mô hình đa phương thức mới nhất nhanh chóng và linh hoạt để mở rộng quy mô cho các nhiệm vụ đa dạng');
    } else if (selectedModel === 'gemini-1.5-flash') {
      setDisplayText('Mô hình đa phương thức nhanh chóng và linh hoạt để mở rộng quy mô cho các nhiệm vụ đa dạng');
    } else if (selectedModel === 'gemini-1.5-pro') {
      setDisplayText('Mô hình đa phương thức cỡ trung hỗ trợ tới 1 triệu token');
    } else if (selectedModel === 'gemini-1.5-pro-latest') {
      setDisplayText('Mô hình đa phương thức cỡ trung hỗ trợ tới 1 triệu token mới nhất');
    }
  }, [selectedModel]);

  if (!isOpen) return null;

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleDeleteAllMessages = () => {
    const MySwal = withReactContent(Swal);
    if (messageHistory.length === 0) {
      Error_Sound();
      showToast('Thông Báo', 'Không có tin nhắn nào để xóa.', 'error');
      return;
    }

    var background, color;

    if(isDarkMode){
        background = '#555';
        color = '#f7f7f7';
    }else{
        background = '#ebebeb';
        color = '#333';
    }
    Click_Sound();
    MySwal.fire({
      title: 'Xác nhận',
      html: 'Bạn có chắc muốn xóa toàn bộ tin nhắn không? Hãy nhập "yes" để xác nhận.',
      icon: 'warning',
      input: 'text',
      background: background,
      color: color,
      inputPlaceholder: 'Nhập "yes" để xác nhận',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      cancelButtonColor: '#d33',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed && result.value.toLowerCase() === 'yes') {
        Success_Sound();
        deleteAllMessages();
        showToast('Thông Báo', 'Đã xóa toàn bộ tin nhắn.', 'success');
        window.location.reload();
      } else if (result.isConfirmed) {
        Click_Sound();
        MySwal.fire('Cancelled', 'Bạn cần nhập "yes" để xác nhận xóa.', 'error');
      }else{
        Click_Sound();
      }
    });
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2>Cài Đặt</h2>
          <button onClick={onClose} className="close-button" title='Đóng' alt='Đóng'>✖️</button>
        </div>
        <div className="settings-modal-content">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isDarkMode} 
              onChange={toggleDarkMode}
              title='Bật/Tắt Chế Độ Tối'
              alt='Bật/Tắt Chế Độ Tối'
            />
            <span className="slider round"></span>
          </label>
          <span className="dark-mode-status">{isDarkMode ? "Đang Bật" : "Đang Tắt"} Chế Độ Tối</span>
        </div><br/>
        <div className="settings-modal-content">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isSoundEffect} 
              onChange={toggleSoundEffect}
              title='Bật/Tắt Âm Thanh'
              alt='Bật/Tắt Âm Thanh' 
            />
            <span className="slider round"></span>
          </label>
          <span className="dark-mode-status">{isSoundEffect ? "Đang Bật" : "Đang Tắt"} Hiệu Ứng Âm Thanh</span>
        </div><br/>
        <div className="settings-modal-content">
          <label htmlFor="model-select">Language Model</label>
          <select id="model-select" value={selectedModel} onChange={handleModelChange} title='Chọn Mô Hình' alt='Chọn Mô Hình'>
            <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash Latest</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro Latest</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>
        </div>
        <div className="settings-modal-content">
          <p><span style={{ fontWeight: 'bold', color: 'red' }}>Mô Tả:</span> {displayText}</p>
        </div><br/>
        <div className="settings-modal-content center">
        <center><button onClick={handleDeleteAllMessages} id="delete_all_chat" className="clear-chat-button" title='Xóa Tất Cả Tin Nhắn' alt='Xóa Tất Cả Tin Nhắn'>🗑️ Xóa Toàn Bộ Tin Nhắn</button></center>
        </div>
        <br/><hr />
        <div className="settings-modal-header">
          <h2>Nhật Ký Thay Đổi Phiên Bản 1.0.Beta</h2>
        </div>
        <div className="settings-modal-content">
            <p>1. Sửa Lỗi Hiển Thị</p>
        </div>
        <div className="settings-modal-content">
            <p>2. Sửa Lỗi Xóa Tất Cả Tin Nhắn</p>
        </div>
        <div className="settings-modal-content">
            <p>3. Cải Thiện Hiệu Ứng Âm Thanh</p>
        </div>
        <div className="settings-modal-content">
            <p>4. Thay Đổi Tên Miền Truy Cập</p>
        </div>
        <div className='settings-modal-content'>
            <p style={{ textAlign: 'center' }}>Developed by <a href="https://www.facebook.com/quancp72h" target="_blank" style={{ color: 'red', textDecoration: 'none' }} rel="noreferrer" title='Facebook của tôi' alt='Facebook của tôi'>Hứa Đức Quân</a></p>
        </div>
      </div>
    </div>
  );
};

const SettingsButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSoundEffect, setIsSoundEffect] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash-latest');

  useEffect(() => {
    // Check if body already has dark-mode class
    setIsDarkMode(document.body.classList.contains('dark-mode'));

    // Get sound effects status from localStorage
    const soundEffects = getDataFromLocalStorage('sound-effects');
    setIsSoundEffect(soundEffects);

    // Get selected model from localStorage
    const savedModel = getDataFromLocalStorage('model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkModeEnabled = document.body.classList.contains('dark-mode');
          setIsDarkMode(isDarkModeEnabled);
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setDataToLocalStorage('sound-effects', isSoundEffect);
  }, [isSoundEffect]);

  useEffect(() => {
    setDataToLocalStorage('model', selectedModel);
  }, [selectedModel]);

  const toggleSoundEffect = () => {
    setIsSoundEffect(prevMode => {
      const newMode = !prevMode;
      On_Off_Sound();
      return newMode;
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
      const newMode = !prevMode;
      if (newMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      On_Off_Sound();
      return newMode;
    });
  };

  return (
    <div>
      <button className="settings-button" onClick={openModal} title='Cài đặt' alt='Cài đặt'>⚙️</button>
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
        />
      )}
    </div>
  );
};

export default SettingsButton;
