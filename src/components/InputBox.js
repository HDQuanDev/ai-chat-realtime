import React, { useState, useEffect, useRef } from 'react';

const InputBox = ({ sendMessage, startDictation, stopDictation, stopSpeaking, onHeightChange }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const inputBoxRef = useRef(null);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
      setIsMobile(true);
    }
  }, []);

  const handleKeyDown = (event) => {
    if (!isMobile && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
    adjustInputHeight();
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      sendMessage();
      setInputValue('');
    }
  };

  const adjustInputHeight = () => {
    const input = inputRef.current;
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  };

  useEffect(() => {
    adjustInputHeight();
  }, [inputValue]);

  useEffect(() => {
    const textarea = inputRef.current;

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          onHeightChange(textarea.scrollHeight);
          break;
        }
      }
    });

    observer.observe(textarea, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, [onHeightChange]);

  return (
    <div
      id="input-box"
      ref={inputBoxRef}
      className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 shadow-lg transition-all duration-300"
    >
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full py-2 px-4 focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-600 transition-all duration-300">
          <button
            id="stop-speaking"
            style={{ display: 'none' }}
            onClick={stopSpeaking}
            className="flex-shrink-0 flex items-center justify-center rounded-full h-8 w-8 text-white bg-red-500 hover:bg-red-600 focus:outline-none transition-all duration-200 ease-in-out mr-2"
            title="Dừng đọc"
          >
            <span className="text-sm">🔇</span>
          </button>
          <button
            onClick={startDictation}
            id="mic"
            title="Nhập bằng giọng nói"
            className="flex-shrink-0 flex items-center justify-center rounded-full h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out mr-2"
          >
            <span className="text-sm">🎤</span>
          </button>
          <button
            id="stop-listening"
            style={{ display: 'none' }}
            onClick={stopDictation}
            className="flex-shrink-0 flex items-center justify-center rounded-full h-8 w-8 text-white bg-blue-500 hover:bg-blue-600 focus:outline-none transition-all duration-200 ease-in-out mr-2"
            title="Dừng nhận dạng giọng nói"
          >
            <span className="text-sm">🛑</span>
          </button>
          <textarea
            ref={inputRef}
            id="user-input"
            placeholder="Nhập tin nhắn..."
            autoFocus
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-grow text-sm w-full focus:outline-none focus:placeholder-gray-400 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 bg-transparent border-none resize-none"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            id="send"
            title="Gửi tin nhắn đi"
            className="flex-shrink-0 flex items-center justify-center rounded-full h-8 w-8 text-white bg-blue-500 hover:bg-blue-600 focus:outline-none transition-all duration-200 ease-in-out ml-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
        <div className="flex justify-center mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
          Câu trả lời chỉ mang tính chất tham khảo, vui lòng kiểm tra trước khi sử dụng
        </div>
      </div>
    </div>
  );
};

export default InputBox;