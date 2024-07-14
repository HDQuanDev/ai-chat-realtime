import React, { useState, useEffect, useRef } from 'react';
import { showToast } from './Toast';

const ThumbnailPreview = ({ image, onRemove }) => (
  <div className="relative group bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md mr-2">
    <img
      src={image}
      alt="Uploaded thumbnail"
      className="w-8 h-8 object-cover rounded"
    />
    <button
      onClick={onRemove}
      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
    >
      ×
    </button>
  </div>
);

const InputBox = ({ sendMessage, startDictation, stopDictation, stopSpeaking, onHeightChange }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const inputRef = useRef(null);
  const inputBoxRef = useRef(null);
  const fileInputRef = useRef(null);

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
    if (inputValue.trim() !== '' || uploadedImage) {
      sendMessage(inputValue, uploadedImage);
      setInputValue('');
      setUploadedImage(null);
    }
  };

  const adjustInputHeight = () => {
    const input = inputRef.current;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
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

  const handlePaste = async (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault();
        const blob = items[i].getAsFile();
        await uploadImage(blob);
        break; // Only upload the first image
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      await uploadImage(file);
    } else {
      showToast('Lỗi', 'Vui lòng chọn một tệp ảnh.', 'error');
    }
  };

  const uploadImage = (file) => {
    if (uploadedImage) {
      showToast('Lỗi', 'Bạn chỉ có thể tải lên một ảnh mỗi lần.', 'error');
      return;
    }

    setIsUploading(true);

    // Sử dụng FileReader để đọc file
    const reader = new FileReader();
    reader.onloadend = () => {
      // Khi đọc file hoàn tất, `reader.result` chứa chuỗi base64 của ảnh
      const base64Image = reader.result;
      setUploadedImage(base64Image);
      setIsUploading(false);
    };
    reader.onerror = (error) => {
      showToast('Lỗi', 'Đã xảy ra lỗi khi tải ảnh lên: ' + error.message, 'error');
      setIsUploading(false);
    };

    // Bắt đầu quá trình đọc file, kết quả trả về là một chuỗi base64
    reader.readAsDataURL(file);
};

  const removeImage = () => {
    setUploadedImage(null);
  };


  return (
    <div
      id="input-box"
      ref={inputBoxRef}
      className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 shadow-lg transition-all duration-300"
    >
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-4 focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-600 transition-all duration-300">
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
          <div className="flex-grow flex items-center">
            {uploadedImage && <ThumbnailPreview image={uploadedImage} onRemove={removeImage} />}
            <textarea
              ref={inputRef}
              id="user-input"
              placeholder="Nhập tin nhắn..."
              autoFocus
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              rows={1}
              className="flex-grow text-sm w-full focus:outline-none focus:placeholder-gray-400 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 bg-transparent border-none resize-none"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            title="Tải ảnh lên"
            className="flex-shrink-0 flex items-center justify-center rounded-full h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleSendMessage}
            id="send"
            title="Gửi tin nhắn đi"
            className="flex-shrink-0 flex items-center justify-center rounded-full h-8 w-8 text-white bg-blue-500 hover:bg-blue-600 focus:outline-none transition-all duration-200 ease-in-out ml-2"
            disabled={isUploading}
          >
            {isUploading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            )}
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