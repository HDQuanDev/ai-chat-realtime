import React, { useState, useEffect, useRef } from 'react';
import ChatBox from './components/ChatBox';
import InputBox from './components/InputBox';
import PwaPrompt from './components/PWAPrompt';
import {showToast} from './components/Toast';
import { marked } from 'marked';
import Swal from 'sweetalert2'
import useDarkMode from './components/useDarkMode';
import withReactContent from 'sweetalert2-react-content'

import { stripHTML, escapeHtml, removeMarkdown, disableButton, enableButton, speakText, stopSpeaking, copyTextToClipboard } from './components/Utils';
import './App.css'; // Import your CSS styles

const App = () => {
  
  const [messageHistory, setMessageHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('messageHistorySave')) || [];
  });
  const isDarkMode = useDarkMode();
  useEffect(() => {
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
    showToast('Change Log', '- Thay đổi giao diện sủ dụng ReactJS.<br>- Tối ưu hóa hiệu suất, tốc độ xử lý và giao diện sử dụng.<br>- Thêm chức năng nói và nghe tin nhắn.<br>- Thêm chức năng sao chép nội dung tin nhắn.<br>- Thêm chức năng xóa toàn bộ tin nhắn.', 'info');
    showToast('Thông Báo', 'Phiên bản 0.5.Beta Build ID: 2024-05-25 By Hứa Đức Quân', 'info');
  

    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

setTimeout(() => {
  document.getElementById('user-input').focus();
  document.getElementById('chat-box').scrollIntoView({ behavior: 'smooth' });
}, 1000); // Increase the timeout to 3000ms
  }, [isDarkMode]);
const deleteAllMessage = () => {
  const MySwal = withReactContent(Swal);
  if (messageHistory.length === 0) {
    showToast('Thông Báo', 'Không có tin nhắn nào để xóa.', 'error');
    return;
  }
  if(isDarkMode){
    var background = '#555';
    var color = '#f7f7f7';
  }else{
    var background = '#ebebeb';
    var color = '#333';
  }
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
      setMessageHistory([]);
      localStorage.removeItem('messageHistorySave');
      showToast('Thông Báo', 'Đã xóa toàn bộ tin nhắn.', 'success');
    } else if (result.isConfirmed) {
      MySwal.fire('Cancelled', 'Bạn cần nhập "yes" để xác nhận xóa.', 'error');
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

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://cloud.qdevs.tech/ai/server.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    
    let text = '';
    let save_text = '';
    let lastIndex = 0;

    aiMessage.className = 'message ai-message';
    aiMessage.textContent = 'Vui lòng chờ... ';
    document.getElementById('chat-box').appendChild(aiMessage);

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
        ...message,
        text: stripHTML(message.text)
      }))
    }));

  };
    let recognition;

    const startDictation = () => {
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
        recognition.stop();
        document.getElementById('stop-listening').style.display = 'none';
        document.getElementById('mic').style.display = 'inline';
      }
    };
  return (
    <div className="app">
      <PwaPrompt />
      <ChatBox
        messageHistory={messageHistory}
        speakText={speakText}
        copyTextToClipboard={(text) => copyTextToClipboard(text)}
        stripHTML={stripHTML}
        escapeHtml={escapeHtml}
        removeMarkdown={removeMarkdown}
      />
      <InputBox
        deleteAllMessage={deleteAllMessage}
        sendMessage={sendMessage}
        startDictation={startDictation}
        stopDictation={stopDictation}
        stopSpeaking={stopSpeaking}
      />
    </div>
  );
};

export default App;
