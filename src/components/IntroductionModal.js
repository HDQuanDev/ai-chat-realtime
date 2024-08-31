import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from './Toast';
import { Click_Sound } from './SoundEffects';

const IntroductionModal = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const idUser = localStorage.getItem('id_user');
    if (!idUser) {
      localStorage.removeItem('messageHistorySave');
      setIsOpen(true);
    }
  }, []);

  const tabs = [
    {
      title: 'Chào mừng bạn đến với phiên bản mới!',
      content: `
        <p>Chúng tôi rất vui khi chào đón bạn đến với phiên bản mới của website!</p>
        <p>Hãy cùng khám phá những tính năng mới và trải nghiệm tuyệt vời nhất!</p>          
      `
    },
    {
      title: 'Cập nhật & Tính năng mới',
      content: `
        <p>Phiên bản mới của website đã được cập nhật với nhiều câp nhật và tính năng mới:</p>
        <ol>
          <li><strong>Giao diện mới</strong>: Được thiết kế lại hoàn toàn mới, sử dụng Tailwind CSS nhằm mang lại trải nghiệm tốt nhất cho người dùng</li>
          <li><strong>Nâng cấp AI</strong>: Mô hình ngôn ngữ tự nhiên đã được cải thiện, giúp trả lời câu hỏi chính xác hơn</li>
          <li><strong>Xử lý ảnh</strong>: Bạn có thể tải ảnh lên và chia sẻ với AI để nhận phản hồi</li>
          <li><strong>Chia sẻ ID Chat</strong>: Bạn có thể chia sẻ ID chat của mình với thiết bị khác để tiếp tục trò chuyện và đồng bộ dữ liệu một cách dễ dàng</li>
          <li><strong>Lưu trữ tin nhắn</strong>: Tất cả tin nhắn sẽ được lưu trữ trên máy chủ, giúp bạn truy cập lại dễ dàng hơn</li>
          <li><strong>Chủ đề chat</strong>: Bạn có thể tạo chủ đề chat mới giúp bạn có thể trò chuyện với nhiều luồng khác nhau</li>
          <li><strong>Sửa lỗi</strong>: Sửa một số lỗi nhỏ và cải thiện hiệu suất như Xóa Toàn Bộ Tin Nhắn, Chế Độ Tối, và nhiều hơn nữa</li>
        </ol>
      `
    },
    {
      title: 'Bắt đầu',
      content: `
        <p>Bạn đã sẵn sàng để bắt đầu hành trình của mình?</p>
        <p>Nếu bạn đã có ID chat, hãy ấn vào nút <b>Cài đặt</b> góc phải màn hình và chọn <b>Cập nhật</b> để nhập ID chat của mình.</p>
        <p>Nếu bạn chưa có ID chat, hãy ấn vào nút <b>Hoàn tất</b> để tạo mới ID chat của mình.</p>
        <p><em>Chúc bạn có trải nghiệm tuyệt vời!</em></p>
      `
    }
  ];

  const handleNext = () => {
    Click_Sound();
    if (currentTab < tabs.length - 1) {
      setCurrentTab(currentTab + 1);
    }
  };

  const handlePrevious = () => {
    Click_Sound();
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const generateUserId = () => {
    return Math.random().toString(36).substring(2, 20);
  };

  const handleComplete = async () => {
    Click_Sound();
    const newUserId = generateUserId();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/RegisterID`, { chat_id: newUserId });
      if (response.data.status === 'success') {
        localStorage.setItem('id_user', newUserId);
        showToast('Thành công', 'ID chat của bạn đã được đăng ký thành công.', 'success');
        window.location.reload();
      } else {
        throw new Error('Failed to register ID');
      }
    } catch (error) {
      showToast('Lỗi', 'Có lỗi xảy ra khi đăng ký ID chat. Vui lòng thử lại.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-xl p-6 w-full max-w-md my-8 transform transition-all duration-300 ease-in-out">
        <div className="flex mb-4">
          {tabs.map((_, index) => (
            <div 
              key={index} 
              className={`flex-1 h-1 ${index <= currentTab ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'} ${index !== 0 ? 'ml-1' : ''}`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">{tabs[currentTab].title}</h2>
        <div 
  className="mb-6 text-center max-h-96 overflow-y-auto prose dark:prose-invert"
  dangerouslySetInnerHTML={{ __html: tabs[currentTab].content }}
/>
        <div className="flex justify-between items-center">
          {currentTab > 0 ? (
            <button
              onClick={handlePrevious}
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              Lùi
            </button>
          ) : <div></div>}
          {currentTab < tabs.length - 1 ? (
            <button
              onClick={handleNext}
              className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              Tiếp
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              Hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroductionModal;