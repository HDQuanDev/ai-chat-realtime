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
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const toggleChatList = () => setIsChatListOpen(!isChatListOpen);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDesktop(true);
        setIsChatListOpen(true);
      } else {
        setIsDesktop(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Check screen size when component mounts
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const isDarkMode = useDarkMode();
  const inputBoxRef = useRef(null);
  const scrollButtonRef = useRef(null);
  useEffect(() => {
 
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    }

    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleHeightChange = (height) => {
    console.log(height);
    if (scrollButtonRef.current && height < '175') {
      var px;
      if(check_is_mobile()){
        px = 80;
      }else{
        px = 65;
      }
      console.log('scrollButtonRef.current', scrollButtonRef.current);
      scrollButtonRef.current.style.setProperty('bottom', `${height + px}px`, 'important');
    }
  };

  const deleteAllMessage = () => {
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
        setMessageHistory([]);
        localStorage.removeItem('messageHistorySave');
        localStorage.removeItem('id_user');
        showToast('Thông Báo', 'Đã xóa toàn bộ tin nhắn.', 'success');
        window.location.reload(true);
      } else if (result.isConfirmed) {
        Click_Sound();
        MySwal.fire('Cancelled', 'Bạn cần nhập "yes" để xác nhận xóa.', 'error');
      } else {
        Click_Sound();
      }
    });
  };

  const sendMessage = (userInput, uploadedImage = null, autoSpeech = false) => {
    if (!userInput.trim() && !uploadedImage) {
      showToast('Thông Báo', 'Vui lòng nhập tin nhắn hoặc đính kèm ảnh.', 'error');
      return;
    }
  
    // Disable input and buttons
    ['send', 'mic', 'user-input'].forEach(disableButton);
  
    const newMessage = {
      sender: 'user',
      text_display: userInput,
    };
  
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
    aiMessage.className = 'flex flex-col items-start mb-4';
  
    const aiMessage_2 = document.createElement('div');
    aiMessage_2.className = 'flex items-center mb-1 flex-row';
  
    const aiMessage_3 = document.createElement('div');
    aiMessage_3.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-green-500 mr-2';
    aiMessage_3.textContent = '🤖';
  
    const aiMessage_4 = document.createElement('span');
    aiMessage_4.className = 'text-sm font-medium text-gray-700 dark:text-gray-300';
    aiMessage_4.textContent = 'AI';
  
    const aiMessage_5 = document.createElement('div');
    aiMessage_5.className = 'max-w-[95%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[65%]';
  
    const aiMessage_6 = document.createElement('div');
    aiMessage_6.className = 'px-4 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out bg-gradient-to-r from-white to-gray-100 text-gray-800 dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:shadow-lg';
  
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
      showToast('Lỗi', 'Không tìm thấy Chat ID. Vui lòng cập nhật ID Chat.', 'error');
      Typing_Message(true);
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
            console.error('Error parsing JSON:', error);
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
  
      const aiResponse = {
        sender: 'ai',
        text_display: save_text
      };
      console.log(aiResponse);
      const storedHistory = JSON.parse(localStorage.getItem('messageHistorySave')) || [];
      const updatedHistory = [...storedHistory, aiResponse];
      setMessageHistory(updatedHistory);
      localStorage.setItem('messageHistorySave', JSON.stringify(updatedHistory));
      console.log(messageHistory);
  
      if (autoSpeech) {
        speakText(removeMarkdown(aiResponse.text));
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
          sendMessage(true);
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
  <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
    {/* Header với nút toggle cho mobile */}
    <div className="bg-blue-600 dark:bg-gray-800 p-3 text-white md:hidden flex items-center justify-between relative">
  <button onClick={toggleChatList} className="p-2 focus:outline-none">
    ☰
  </button>
  <h1 className="text-lg font-semibold text-left">
    {getTitleByCode(getDataFromLocalStorage('active_chat'))}
  </h1>
  {!isDesktop && (
    <SettingsButton className="absolute top-4 right-4 z-10 block md:block" deleteAllMessage={deleteAllMessage} />
  )}
</div>




{isDesktop && (
    <SettingsButton className="absolute top-4 right-4 z-10 block md:block" deleteAllMessage={deleteAllMessage} />
  )}

    <div className="flex flex-1 overflow-hidden">
      {/* ChatList */}
      <ChatList isOpen={isChatListOpen} toggleChatList={toggleChatList} />

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900 transition-transform duration-300 ease-in-out ${
          isChatListOpen ? 'transform-none' : 'transform md:-translate-x-80'
        }`}
      >

        {!isChatListOpen && isDesktop && (
          <button
            onClick={toggleChatList}
            className="absolute top-4 left-4 p-2 bg-blue-500 dark:bg-gray-700 text-white rounded-md focus:outline-none z-10"
          >
            ☰
          </button>
        )}
        <div className="flex-1 overflow-y-auto relative">
          <LoadChat setMessageHistory={setMessageHistory} />
          <IntroductionModal />
          <Notifications />
          
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
        />
      </div>
    </div>
  </div>
</MessageProvider>

  );
  
};

export default App;
