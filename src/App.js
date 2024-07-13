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
// import ShareButton from './components/ShareButton';
import LoadChat from './components/LoadChat';
import { Receive_Message, Typing_Message, Click_Sound, Success_Sound, Error_Sound } from './components/SoundEffects';
import { stripHTML, escapeHtml, removeMarkdown, disableButton, enableButton, speakText, stopSpeaking, copyTextToClipboard, check_is_mobile, getDataFromLocalStorage, setDataToLocalStorage } from './components/Utils';

const App = () => {
  const [messageHistory, setMessageHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('messageHistorySave')) || [];
  });

  const isDarkMode = useDarkMode();
  const inputBoxRef = useRef(null);
  const scrollButtonRef = useRef(null);
  useEffect(() => {
    const Sound_Effects = getDataFromLocalStorage('sound-effects');
    if (Sound_Effects == null) {
      setDataToLocalStorage('sound-effects', true);
      
    }

    if(!getDataFromLocalStorage('install')){
      localStorage.clear();
      setDataToLocalStorage('install', true);
      window.location.reload(true);
    }
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    }
    
    showToast('Thông Báo', 'Phiên bản 1.1.Official đã được cập nhật, để xem thêm thông tin vui lòng truy cập mục Thông Tin trong Cài Đặt.', 'info');

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

  const sendMessage = (autoSpeech = false) => {
    const userInput = document.getElementById('user-input').value;
    if (!userInput){
      showToast('Thông Báo', 'Vui lòng nhập tin nhắn.', 'error');
      return;
    }
    
    // Disable input and buttons
    ['send', 'mic', 'user-input'].forEach(disableButton);
    
    const newMessage = {
      sender: 'user',
      text: userInput,
      text_display: userInput
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
    sendToServer(userInput, aiMessage, autoSpeech);
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
    aiMessage_5.className = 'max-w-[90%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[40%]';
  
    const aiMessage_6 = document.createElement('div');
    aiMessage_6.className = 'px-4 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out bg-gradient-to-r from-white to-gray-100 text-gray-800 dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:shadow-lg';
  
    const aiMessage_7 = document.createElement('div');
    aiMessage_7.className = 'prose prose-sm max-w-none dark:prose-invert text-sm sm:text-base';
  
    // Append elements in the correct order
    aiMessage_6.appendChild(aiMessage_7);
    aiMessage_5.appendChild(aiMessage_6);
    aiMessage_2.appendChild(aiMessage_3);
    aiMessage_2.appendChild(aiMessage_4);
    aiMessage.appendChild(aiMessage_2);
    aiMessage.appendChild(aiMessage_5);
  
    return aiMessage;
  };
  
  const chat_id = getDataFromLocalStorage('id_user');
  const sendToServer = (userInput, aiMessage, autoSpeech) => {
    Typing_Message();
  
    const modal_select = getDataFromLocalStorage('model');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${process.env.REACT_APP_API_URL_CHAT}?model=${modal_select}`, true);
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
          const json = JSON.parse(line.replace('data: ', ''));
          if (json.text) {
            const markdown = json.text;
            text += markdown;
            save_text += markdown;
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
  
      let save_text_storage = stripHTML(removeMarkdown(save_text)).replace(/(\r\n|\n|\r)/gm, " ");
  
      const aiResponse = {
        sender: 'ai',
        text: save_text_storage,
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
      document.getElementById('chat-box').removeChild(aiMessage);
      ['send', 'mic', 'user-input'].forEach(enableButton);
    };
    
    xhr.send(JSON.stringify({
      message: userInput,
      chat_id: chat_id,
    }));
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
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex-grow overflow-hidden relative">
          <LoadChat setMessageHistory={setMessageHistory} />
          <IntroductionModal />
          <SettingsButton className="absolute top-4 right-4 z-10"
          deleteAllMessage={deleteAllMessage}
          />
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
    </MessageProvider>
  );
};

export default App;
