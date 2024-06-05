import React, { useState, useEffect, useRef } from 'react';
import ChatBox from './components/ChatBox';
import InputBox from './components/InputBox';
import PwaPrompt from './components/PWAPrompt';
import {showToast} from './components/Toast';
import { marked } from 'marked';
import Swal from 'sweetalert2';
import useDarkMode from './components/useDarkMode';
import withReactContent from 'sweetalert2-react-content';
import SettingsButton from './components/Settings';
import { Send_Message, Receive_Message, Typing_Message, Click_Sound,Success_Sound, Error_Sound, Slide_Down_Sound } from './components/SoundEffects';
import { stripHTML, escapeHtml, removeMarkdown, disableButton, enableButton, speakText, stopSpeaking, copyTextToClipboard, check_is_mobile, getDataFromLocalStorage, setDataToLocalStorage } from './components/Utils';
import './App.css';

const App = () => {
  const [messageHistory, setMessageHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('messageHistorySave')) || [];
  });

  const isDarkMode = useDarkMode();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const inputBoxRef = useRef(null);
  const scrollButtonRef = useRef(null);

  useEffect(() => {
    const Sound_Effects = getDataFromLocalStorage('sound-effects');
    if (Sound_Effects == null) {
      setDataToLocalStorage('sound-effects', true);
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    }

    showToast('Thông Báo', 'Lịch sử tin nhắn đã được tải.', 'success');
    showToast('Hệ Thống', 'Bạn có thể thay đổi Mô Hình AI trong phần Cài Đặt góc trên màn hình.', 'info');
    showToast('Thông Báo', 'Phiên bản 0.7.2.Beta Build ID: 2024-06-03 By Hứa Đức Quân', 'info');

    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    const handleScroll = () => {
      const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
      setShowScrollButton(!bottom);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDarkMode]);

 // Khởi tạo state để lưu trữ chiều cao

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

  const scrollToBottom = () => {
    Slide_Down_Sound();
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
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
        showToast('Thông Báo', 'Đã xóa toàn bộ tin nhắn.', 'success');
      } else if (result.isConfirmed) {
        Click_Sound();
        MySwal.fire('Cancelled', 'Bạn cần nhập "yes" để xác nhận xóa.', 'error');
      }else{
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
    disableButton('send');
    disableButton('mic');
    disableButton('user-input');
    const newMessage = {
      sender: 'user',
      text: userInput,
      text_display: userInput
    };
    const aiMessage = document.createElement('div');
    aiMessage.scrollIntoView({ behavior: 'smooth' });
    setMessageHistory([...messageHistory, newMessage]);
    localStorage.setItem('messageHistorySave', JSON.stringify([...messageHistory, newMessage]));
    Send_Message();
    const modal_select = getDataFromLocalStorage('model');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://cloud.qdevs.tech/ai/server.php?model=' + modal_select, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Referer', 'ai.qdevs.tech');
    
    let text = '';
    let save_text = '';
    let lastIndex = 0;

    aiMessage.className = 'message ai-message';
    aiMessage.textContent = 'Vui lòng chờ... ';
    document.getElementById('chat-box').appendChild(aiMessage);
    Typing_Message();
    xhr.onprogress = function () {
      
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

      let text_no_html_ai = stripHTML(text);
      text_no_html_ai = removeMarkdown(text_no_html_ai);
      text_no_html_ai = escapeHtml(text_no_html_ai);
      text_no_html_ai = encodeURIComponent(text_no_html_ai);

      aiMessage.innerHTML = marked(text) + `<hr><button onclick="speakText('${text_no_html_ai}')">🔊</button> <button onclick="copyTextToClipboard('${text_no_html_ai}')">📋</button>`;
      document.getElementById('chat-box').appendChild(aiMessage);
      aiMessage.scrollIntoView({ behavior: 'smooth' });
    };

    xhr.onload = function () {
      Typing_Message(true);
      Receive_Message();
      document.getElementById('chat-box').removeChild(aiMessage);
      let save_text_storage = removeMarkdown(save_text);
      save_text_storage = stripHTML(save_text_storage);
      save_text_storage = save_text_storage.replace(/(\r\n|\n|\r)/gm, " ");

      const aiResponse = {
        sender: 'ai',
        text: save_text_storage,
        text_display: marked(save_text)
      };

      setMessageHistory((prev) => {
        const updatedHistory = [...prev, aiResponse];
        localStorage.setItem('messageHistorySave', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

      if (autoSpeech) {
        const textToSpeak = removeMarkdown(aiResponse.text);
        speakText(textToSpeak);
      }

      enableButton('send');
      enableButton('mic');
      enableButton('user-input');
    };

    xhr.onerror = function () {
      // Use Toast instead of alert
      showToast('Thông Báo', 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.', 'error');
      document.getElementById('chat-box').removeChild(aiMessage);
      enableButton('send');
      enableButton('mic');
      enableButton('user-input');
    };

    xhr.send(JSON.stringify({
      message: userInput,
      history: messageHistory.map(message => ({
        sender: message.sender,
        text: stripHTML(message.text)
      }))
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
    <div className="app">
      <PwaPrompt />
      <SettingsButton />
      <ChatBox
        messageHistory={messageHistory}
        speakText={speakText}
        copyTextToClipboard={(text) => copyTextToClipboard(text)}
        stripHTML={stripHTML}
        escapeHtml={escapeHtml}
        removeMarkdown={removeMarkdown}
      />
      <InputBox
        onHeightChange={handleHeightChange}
        deleteAllMessage={deleteAllMessage}
        sendMessage={sendMessage}
        startDictation={startDictation}
        stopDictation={stopDictation}
        stopSpeaking={stopSpeaking}
        inputBoxRef={inputBoxRef}
      />
      {showScrollButton && (
        <button className="scroll-button" onClick={scrollToBottom} ref={scrollButtonRef}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="icon-md m-1 text-token-text-primary"><path fill="currentColor" fillRule="evenodd" d="M12 21a1 1 0 0 1-.707-.293l-7-7a1 1 0 1 1 1.414-1.414L11 17.586V4a1 1 0 1 1 2 0v13.586l5.293-5.293a1 1 0 0 1 1.414 1.414l-7 7A1 1 0 0 1 12 21" clipRule="evenodd"></path></svg>
        </button>
      )}
    </div>
  );
};

export default App;
