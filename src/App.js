import React, { useState, useEffect, useRef } from 'react';
import ChatBox from './components/ChatBox';
import InputBox from './components/InputBox';
import PwaPrompt from './components/PWAPrompt';
import {showToast} from './components/Toast';
import { marked } from 'marked';
import { stripHTML, escapeHtml, removeMarkdown, disableButton, enableButton, speakText, startDictation, stopDictation, stopSpeaking, copyTextToClipboard } from './components/Utils';
import './App.css'; // Import your CSS styles

const App = () => {
  showToast('Thông Báo', 'Lịch sử tin nhắn đã được tải.', 'success');
  showToast('Change Log', '- Thay đổi giao diện sủ dụng ReactJS.<br>- Tối ưu hóa hiệu suất và tốc độ xử lý.<br>- Thêm chức năng nói và nghe tin nhắn.', 'info');
  showToast('Thông Báo', 'Phiên bản 0.5.Beta Build ID: 2024-05-25 By Hứa Đức Quân', 'info');
  const [messageHistory, setMessageHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('messageHistorySave')) || [];
  });

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
  }, []);

  const sendMessage = (autoSpeech = false) => {
    disableButton('send');
    disableButton('mic');
    disableButton('user-input');
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;

    const newMessage = {
      sender: 'user',
      text: userInput,
      text_display: userInput
    };

    setMessageHistory([...messageHistory, newMessage]);
    localStorage.setItem('messageHistorySave', JSON.stringify([...messageHistory, newMessage]));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://localhost/server.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    
    let text = '';
    let save_text = '';
    let lastIndex = 0;

    const aiMessage = document.createElement('div');
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

    document.getElementById('user-input').value = '';
  };
  const startDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "vi-VN";
      recognition.start();
  
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
        }
      };
  
      recognition.onerror = () => {
        recognition.stop();
        document.getElementById('stop-listening').style.display = 'none';
      };
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
        sendMessage={sendMessage}
        startDictation={startDictation}
        stopDictation={stopDictation}
        stopSpeaking={stopSpeaking}
      />
    </div>
  );
};

export default App;
