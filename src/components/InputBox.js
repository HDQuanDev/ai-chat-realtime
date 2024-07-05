import React, { useState, useEffect, useRef } from 'react';

const InputBox = ({ sendMessage, startDictation, stopDictation, stopSpeaking, deleteAllMessage, onHeightChange   }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const inputBoxRef = useRef(null);

  useEffect(() => {
    // Kiểm tra nếu thiết bị là di động
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
      setIsMobile(true);
    }
  }, []);

  const handleKeyDown = (event) => {
    if (!isMobile) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
    adjustInputHeight();
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      sendMessage();
      setInputValue(''); // Reset input value
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
          onHeightChange(textarea.scrollHeight); // Gọi hàm callback khi chiều cao thay đổi
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
    <div id="input-box" ref={inputBoxRef}>
      <div className="input-area">
        <button id="stop-speaking" style={{ display: 'none' }} onClick={stopSpeaking} className='stop-button' title='Dừng đọc' alt='Dừng đọc'>🔇</button>
        <button onClick={startDictation} id="mic" title='Nhập bằng giọng nói' alt='Nhập bằng giọng nói'>🎤</button>
        <button id="stop-listening" style={{ display: 'none' }} onClick={stopDictation} className='clear-button' title='Dừng nhận dạng giọng nói' alt='Dừng nhận dạng giọng nói'>🛑</button>
        <textarea
          ref={inputRef}
          id="user-input"
          placeholder="Nhập tin nhắn..."
          autoFocus
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{
            maxHeight: '150px', // Adjust the max height as needed
            overflowY: 'auto'
          }}
          title='Nhập tin nhắn'
          alt='Nhập tin nhắn'
        />
        <button onClick={handleSendMessage} id="send" title='Gửi tin nhắn đi' alt='Gửi tin nhắn đi'>➤</button>
      </div>
      <div className='note'>Các câu trả lời của mô hình chỉ mang tính chất tham khảo, vui lòng kiểm tra thông tin trước khi sử dụng.</div>
    </div>
  );
};

export default InputBox;
