import React, { useState, useEffect, useRef } from 'react';
import ChatBox from './components/ChatBox';
import InputBox from './components/InputBox';
import PwaPrompt from './components/PWAPrompt';
import { showToast } from './components/Toast';
import { marked } from 'marked';
import Swal from 'sweetalert2';
import useDarkMode from './components/useDarkMode';
import withReactContent from 'sweetalert2-react-content';
import SettingsButton from './components/Settings';
import { MessageProvider } from './components/MessageContext';
import IntroductionModal from './components/IntroductionModal';
import Notifications from './components/Notifications';
import ChatList from './components/ListChat';
import CheckData from './components/CheckData';
import LoadChat from './components/LoadChat';
import { Receive_Message, Typing_Message, Click_Sound, Success_Sound, Error_Sound } from './components/SoundEffects';
import { stripHTML, escapeHtml, removeMarkdown, disableButton, enableButton, speakText, stopSpeaking, copyTextToClipboard, check_is_mobile, getDataFromLocalStorage, getTitleByCode } from './components/Utils';

const App = () => {
  const [messageHistory, setMessageHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('messageHistorySave')) || [];
  });
  const [isChatListOpen, setIsChatListOpen] = useState(window.innerWidth >= 768);
const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
const [inputError, setInputError] = useState(false);

const toggleChatList = () => {
  setIsChatListOpen(prev => !prev);
  Click_Sound();
};
useEffect(() => {
  const handleResize = () => {
    const newIsDesktop = window.innerWidth >= 768;
    if (newIsDesktop !== isDesktop) {
      setIsDesktop(newIsDesktop);
      if (newIsDesktop) {
        setIsChatListOpen(true);
      }
    }
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, [isDesktop]);

// drag and drop

const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Handle the dropped file here if needed
      showToast('Thông Báo', 'Vui lòng kéo và thả ảnh vào ô nhập tin nhắn.', 'info');
      setInputError(true);
      setTimeout(() => setInputError(false), 1000);
      // You can also pass this file to InputBox if needed
    }
  };

  const isDarkMode = useDarkMode();
  const inputBoxRef = useRef(null);
  const scrollButtonRef = useRef(null);
  useEffect(() => {
 
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker đã được đăng ký cho: ', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker đăng ký thất bại: ', err);
        });
    }

    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleHeightChange = (height) => {
    if (scrollButtonRef.current && height < '175') {
      var px;
      if(check_is_mobile()){
        px = 80;
      }else{
        px = 65;
      }
      scrollButtonRef.current.style.setProperty('bottom', `${height + px}px`, 'important');
    }
  };
  var background, color;

  if(isDarkMode){
      background = '#555';
      color = '#f7f7f7';
  }else{
      background = '#ebebeb';
      color = '#333';
  }
  const deleteAllMessage = () => {
    const MySwal = withReactContent(Swal);
    if (messageHistory.length === 0) {
      Error_Sound();
      showToast('Thông Báo', 'Không có tin nhắn nào để xóa.', 'error');
      return;
    }


    Click_Sound();
    MySwal.fire({
      title: 'Xác nhận',
      html: 'Bạn có chắc muốn xóa toàn bộ tin nhắn không?',
      icon: 'warning',
      background: background,
      color: color,
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      cancelButtonColor: '#d33',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        Success_Sound();
        setMessageHistory([]);
        localStorage.removeItem('messageHistorySave');
        localStorage.removeItem('id_user');
        showToast('Thông Báo', 'Đã xóa toàn bộ tin nhắn.', 'success');
        window.location.reload(true);
      } else {
        Click_Sound();
      }
    });    
  };

  const sendMessage = (userInput, uploadedImage = null, autoSpeech = false) => {
    if (!userInput.trim()) {
      showToast('Thông Báo', 'Vui lòng nhập tin nhắn.', 'error');
      setInputError(true);
      setTimeout(() => setInputError(false), 1000);
      return;
    }
  
    // Kiểm tra nếu có ảnh nhưng không có tin nhắn
    if (uploadedImage && !userInput.trim()) {
      showToast('Thông Báo', 'Vui lòng nhập tin nhắn và đính kèm ảnh.', 'error');
      setInputError(true);
      setTimeout(() => setInputError(false), 1000);
      return;
    }
    // Disable input and buttons
    ['send', 'mic', 'user-input'].forEach(disableButton);
    var newMessage;
    if(uploadedImage == null){
    newMessage = {
      sender: 'user',
      text_display: userInput,
    };
  }else{
    newMessage = {
      sender: 'user',
      image_url: '/assets/images/wait.png',
      text_display: userInput,
    };
  }
  
    // Add user's message to the chat
    const updatedHistory = [...messageHistory, newMessage];
    setMessageHistory(updatedHistory);
    localStorage.setItem('messageHistorySave', JSON.stringify(updatedHistory));
  
    // Create AI message container
    const aiMessage = createAIMessageElement();
    aiMessage.querySelector('.prose').innerHTML = 'Vui lòng chờ...';
    document.getElementById('add-message').appendChild(aiMessage);
    aiMessage.scrollIntoView({ behavior: 'smooth' });
  
    // Send message to server
    sendToServer(userInput, aiMessage, uploadedImage, autoSpeech);
  };
  
  const createAIMessageElement = () => {
    const aiMessage = document.createElement('div');
    aiMessage.className = 'flex flex-col items-start mb-6';
  
    const aiMessage_2 = document.createElement('div');
    aiMessage_2.className = 'flex items-center mb-1 flex-row';
  
    const aiMessage_3 = document.createElement('div');
    aiMessage_3.className = 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-teal-500 dark:from-green-500 dark:to-teal-600 mr-3';
    aiMessage_3.textContent = '🤖';
  
    const aiMessage_4 = document.createElement('span');
    aiMessage_4.className = 'text-sm font-medium text-gray-600 dark:text-gray-400 mb-1';
    aiMessage_4.textContent = 'AI';
  
    const aiMessage_5 = document.createElement('div');
    aiMessage_5.className = 'max-w-[95%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[65%]';
  
    const aiMessage_6 = document.createElement('div');
    aiMessage_6.className = 'px-5 py-4 rounded-2xl shadow-md transition-all duration-300 ease-in-out bg-gradient-to-r from-white to-gray-100 text-gray-800 dark:from-gray-700 dark:to-gray-800 dark:text-gray-200 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:shadow-lg transform hover:-translate-y-1';
  
    const aiMessage_7 = document.createElement('div');
    aiMessage_7.className = 'prose prose-sm max-w-none dark:prose-invert text-base';
  
    // Append elements in the correct order
    aiMessage_6.appendChild(aiMessage_7);
    aiMessage_5.appendChild(aiMessage_6);
    aiMessage_2.appendChild(aiMessage_3);
    aiMessage_2.appendChild(aiMessage_4);
    aiMessage.appendChild(aiMessage_2);
    aiMessage.appendChild(aiMessage_5);
  
    return aiMessage;
  };
  
  const sendToServer = (userInput, aiMessage, uploadedImage = null, autoSpeech) => {
    Typing_Message();
  
    const modal_select = getDataFromLocalStorage('model');
    const current_chat_id = getDataFromLocalStorage('active_chat');
  
    if (!current_chat_id) {
      Swal.fire({
        title: 'Thông Báo',
        text: 'Không tìm thấy ID Topic Chat. Vui lòng chọn một chủ đề trước khi gửi tin nhắn.',
        icon: 'info',
        color: color,
      background: background,
        showCancelButton: false,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
      Typing_Message(true);
      if (aiMessage && aiMessage.parentNode) {
        document.getElementById('add-message').removeChild(aiMessage);
      }
      return;
    }
  
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${process.env.REACT_APP_API_URL_CHAT}?model=${encodeURIComponent(modal_select)}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  
    let text = '';
    let save_text = '';
    let lastIndex = 0;
  
    xhr.onprogress = () => {
      const newResponse = xhr.responseText.substring(lastIndex);
      lastIndex = xhr.responseText.length;
  
      const lines = newResponse.split('\n').filter(line => line.trim() !== '');
  
      lines.forEach(line => {
        if (line.trim().startsWith('data: ')) {
          try {
            const json = JSON.parse(line.replace('data: ', ''));
            if (json.text) {
              const markdown = json.text;
              text += markdown;
              save_text += markdown;
            }
          } catch (error) {
            showToast('Lỗi', 'Đã xảy ra lỗi khi phân tích cú pháp phản hồi từ máy chủ.', 'error');
          }
        }
      });
  
      aiMessage.querySelector('.prose').innerHTML = marked(text) + `<br><hr><span class="code-language font-mono text-xs text-gray-600 dark:text-gray-300">AI đang trả lời, vui lòng kiểm tra thông tin trước khi sử dụng...</span>`;
      document.getElementById('chat-box').appendChild(aiMessage);
      aiMessage.scrollIntoView({ behavior: 'smooth' });
    };
  
    xhr.onload = () => {
      Typing_Message(true);
      Receive_Message();
      document.getElementById('chat-box').removeChild(aiMessage);
  
      if (!save_text.trim()) {
        showToast('Lỗi', 'Tin nhắn từ AI bị trống hoặc không hợp lệ. Vui lòng thử lại sau.', 'error');
        ['send', 'mic', 'user-input'].forEach(enableButton);
        return;
      }
  
      const aiResponse = {
        sender: 'ai',
        text_display: save_text
      };
  
      const storedHistory = JSON.parse(localStorage.getItem('messageHistorySave')) || [];
      const updatedHistory = [...storedHistory, aiResponse];
      setMessageHistory(updatedHistory);
      localStorage.setItem('messageHistorySave', JSON.stringify(updatedHistory));
  
      if (autoSpeech) {
        speakText(removeMarkdown(aiResponse.text_display));
      }
      ['send', 'mic', 'user-input'].forEach(enableButton);
    };
  
    xhr.onerror = () => {
      showToast('Thông Báo', 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.', 'error');
      Typing_Message(true);
      if (document.getElementById('chat-box').contains(aiMessage)) {
        document.getElementById('chat-box').removeChild(aiMessage);
      }
      ['send', 'mic', 'user-input'].forEach(enableButton);
    };
  
    const payload = JSON.stringify({
      message: userInput,
      chat_id: current_chat_id,
      image: uploadedImage ? uploadedImage : undefined
    });
  
    xhr.send(payload);
  };
  
  
  let recognition;

  const startDictation = () => {
    if(!check_is_mobile()){
      Click_Sound();
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "vi-VN";
      recognition.start();

      document.getElementById('mic').style.display = 'none';
      document.getElementById('stop-listening').style.display = 'inline';

      recognition.onresult = (e) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          } else {
            interimTranscript += e.results[i][0].transcript;
          }
        }

        document.getElementById('user-input').value = finalTranscript + interimTranscript;

        if (finalTranscript) {
          recognition.stop();
          sendMessage(finalTranscript + interimTranscript, null, true);
          document.getElementById('stop-listening').style.display = 'none';
          document.getElementById('mic').style.display = 'inline';
        }
      };

      recognition.onerror = () => {
        recognition.stop();
        document.getElementById('stop-listening').style.display = 'none';
        document.getElementById('mic').style.display = 'inline';
      };
    }
  };

  const stopDictation = () => {
    if (recognition) {
      if(!check_is_mobile()){
        Click_Sound();
      }
      recognition.stop();
      document.getElementById('stop-listening').style.display = 'none';
      document.getElementById('mic').style.display = 'inline';
    }
  };

  return (
<MessageProvider>
  <CheckData />
  <div
        className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900"
      >
    {/* Header với nút toggle cho mobile */}
    <div className="bg-blue-600 dark:bg-gray-800 p-3 text-white md:hidden flex items-center justify-between relative">
  <button onClick={toggleChatList} className="p-2 focus:outline-none transition duration-300 ease-in-out transform hover:scale-110">
    ☰
  </button>
  <h1 className="text-lg font-semibold text-center flex-1 mx-2">
    {getTitleByCode(getDataFromLocalStorage('active_chat'))}
  </h1>
  <div className="p-2"> {/* Placeholder để cân bằng với nút menu */}
    {!isDesktop && (
      <SettingsButton className="focus:outline-none transition duration-300 ease-in-out transform hover:scale-110" deleteAllMessage={deleteAllMessage} />
    )}
  </div>
</div>


    <div className="flex flex-1 overflow-hidden">
      {/* ChatList */}
      <ChatList isOpen={isChatListOpen} toggleChatList={toggleChatList} />
      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900 transition-all duration-300 ease-in-out  ${
          isChatListOpen ? 'md:ml-0' : 'md:-ml-80'
        }`}
      >
        {!isChatListOpen && isDesktop && (
          <button
            onClick={toggleChatList}
            className="absolute top-4 left-4 p-2 bg-blue-500 dark:bg-gray-700 text-white rounded-md focus:outline-none z-10 transition duration-300 ease-in-out transform hover:scale-110"
          >
            ☰
          </button>
        )}
        <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
         className="flex-1 overflow-y-auto relative">
          <LoadChat setMessageHistory={setMessageHistory} />
          <IntroductionModal />
          <Notifications />
          {isDesktop && (
      <SettingsButton className="focus:outline-none transition duration-300 ease-in-out z-[100] transform hover:scale-110" deleteAllMessage={deleteAllMessage} />
    )}

          <PwaPrompt />
          <ChatBox
            messageHistory={messageHistory}
            speakText={speakText}
            copyTextToClipboard={(text) => copyTextToClipboard(text)}
            stripHTML={stripHTML}
            escapeHtml={escapeHtml}
            removeMarkdown={removeMarkdown}
          />
        </div>
        <InputBox
          onHeightChange={handleHeightChange}
          sendMessage={sendMessage}
          startDictation={startDictation}
          stopDictation={stopDictation}
          stopSpeaking={stopSpeaking}
          inputBoxRef={inputBoxRef}
          inputError={inputError}
          isDragging2={isDragging}
        />
      </div>
    </div>
  </div>
</MessageProvider>

  );
  
};

export default App;
