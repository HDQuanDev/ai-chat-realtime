import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { Click_Sound } from './SoundEffects';

const ImagePopup = ({ imageUrl, onClose, altText }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full h-full flex items-center justify-center animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={altText}  // Updated alt attribute
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 hover:bg-opacity-75 focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center transition-all duration-300 transform hover:scale-110"
          aria-label="Close popup"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};


const ChatBox = ({ messageHistory, speakText, copyTextToClipboard, stripHTML, escapeHtml }) => {
  const messagesEndRef = useRef(null);
  const [checkTopicAi, setCheckTopicAi] = useState(false);
  const chatBoxRef = useRef(null);
  const [popupImage, setPopupImage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const handlePopupImage = (imageUrl) => {
    Click_Sound();
    setPopupImage(imageUrl);
  };

  useEffect(scrollToBottom, [messageHistory]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatBoxRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
        const bottomThreshold = 100;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > bottomThreshold);
      }
    };

    const chatBoxElement = chatBoxRef.current;
    if (chatBoxElement) {
      chatBoxElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (chatBoxElement) {
        chatBoxElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  if (!Array.isArray(messageHistory)) {
    messageHistory = [];
  }

  marked.setOptions({
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  });

  const processMarkedOutput = (html) => {
    const codeRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
    return html.replace(codeRegex, (match, language, code) => {
      return `
      <div class="code-container my-6 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl bg-gray-900 border border-gray-700">
        <div class="code-header flex justify-between items-center bg-gradient-to-r from-blue-800 to-purple-800 p-3">
          <span class="code-language font-mono text-xs text-gray-300 uppercase">${language}</span>
          <button class="copy-code-button text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 py-1 px-3 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500" onclick="copyCode(this)">
            📋 Sao chép mã
          </button>
        </div><div class="overflow-x-auto"><pre class="m-0"><code class="language-${language} block p-4 text-sm">${code}</code></pre></div>
      </div>
    `;
    });
  };

  useEffect(() => {
    window.copyCode = function(button) {
      const codeContainer = button.closest('.code-container');
      const code = codeContainer.querySelector('code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ Đã sao chép';
        button.classList.add('bg-green-500', 'text-white');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-500', 'text-white');
        }, 2000);
      }).catch(err => {
        console.error('Không thể sao chép mã: ', err);
      });
    };

    hljs.highlightAll();
  }, [messageHistory]);
  useEffect(() => {
    const checkActiveChat = () => {
      const get_active_chat = localStorage.getItem('active_chat');
      if (get_active_chat !== null && get_active_chat !== '' && get_active_chat !== undefined) {
        setCheckTopicAi(true);
      }
    };
  
    const handleStorageChange = (event) => {
      if (event.key === 'active_chat') {
        checkActiveChat();
      }
    };
  
    // Kiểm tra giá trị của active_chat khi component được mount
    checkActiveChat();
  
    // Theo dõi sự thay đổi của localStorage từ các tab khác
    window.addEventListener('storage', handleStorageChange);
  
    // Theo dõi sự thay đổi của localStorage trong cùng một tab
    const intervalId = setInterval(checkActiveChat, 100);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);
  return (
    <div 
      id="chat-box" 
      ref={chatBoxRef}
      className="h-full overflow-auto p-4 space-y-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 relative"
    >
      <div className="flex flex-col space-y-6 p-3 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-gray-800 scrollbar-thumb-rounded scrollbar-track-rounded leading-relaxed text-base/loose" id="add-message">
        {messageHistory.length === 0 ? (
          <div className="flex items-center justify-center flex-grow">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md transform transition-all duration-300 hover:scale-102 border border-blue-200 dark:border-blue-700">
              <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Chào mừng!</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Tôi là mô hình ngôn ngữ tự nhiên được huấn luyện để trả lời các câu hỏi về mọi thứ. 
                Nếu bạn có bất kỳ câu hỏi nào, hãy hỏi tôi!
              </p>
              {checkTopicAi === false ? (
                <p className="text-red-600 dark:text-red-400 text-xl font-semibold">Vui lòng chọn đoạn chat có sẵn hoặc tạo đoạn chat mới để bắt đầu trò chuyện với AI.</p>
              ) : ( <p className="text-red-600 dark:text-red-300"> </p> )}
            </div>
          </div>
        ) : (
          messageHistory.map((message, index) => {
            const textNoHtml = stripHTML(message.text_display);
            const textNoHtmlEscaped = escapeHtml(textNoHtml);
            const textSpeak = encodeURIComponent(textNoHtmlEscaped);
            let text_display = message.sender === 'user' ? message.text_display.replace(/\n/g, "<br>") : message.text_display;
            const markedOutput = marked(text_display);
            const processedHtml = processMarkedOutput(markedOutput);

            return (
              <div key={index} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} mb-6`}>
                <div className={`flex items-center mb-1 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 ml-3' : 'bg-gradient-to-br from-green-400 to-teal-500 dark:from-green-500 dark:to-teal-600 mr-3'}`}>
                    {message.sender === 'user' ? '👤' : '🤖'}
                  </div>
                  
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {message.sender === 'user' ? 'User' : 'AI'}
                  </span>
                </div>
                <div className={`
                  max-w-[95%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[65%]
                `}>
                  <div className={`px-5 py-4 rounded-2xl shadow-md transition-all duration-300 ease-in-out
                    ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white dark:from-indigo-600 dark:to-purple-700 hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800'
                      : 'bg-gradient-to-r from-white to-gray-100 text-gray-800 dark:from-gray-700 dark:to-gray-800 dark:text-gray-200 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700'
                    } hover:shadow-lg transform hover:-translate-y-1`}>
                    {message.image_url && (
                      <div className="mb-4">
                        <div className="relative group">
                          <img
                            src={message.image_url}
                            alt="User uploaded content"
                            className="mx-auto w-full h-auto max-w-xs rounded-lg shadow-md transition-all duration-300 ease-in-out group-hover:shadow-lg dark:shadow-gray-800 cursor-pointer"
                            onClick={() => setPopupImage(message.image_url)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => handlePopupImage(message.image_url)}
                              className="hidden group-hover:block bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition-all duration-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                            >
                              Xem full
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: processedHtml }} className="prose prose-sm max-w-none dark:prose-invert text-base" />
                    
                  </div>
                    <div className="flex mt-2 space-x-2">
                      <button 
                        onClick={() => speakText(textSpeak)} 
                        className="text-xs bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
                        title='Đọc tin nhắn'
                      >
                        🔊 Nghe
                      </button>
                      <button 
                        onClick={() => copyTextToClipboard(textSpeak)} 
                        className="text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
                        title='Sao chép tin nhắn'
                      >
                        📋 Sao Chép
                      </button>
                    </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {showScrollButton && (
        <div className="fixed bottom-32 right-5 transform -translate-x-1/2 z-10">
          <button
            onClick={scrollToBottom}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-400 flex items-center space-x-2"
            title="Cuộn xuống cuối"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {popupImage && (
        <ImagePopup
          imageUrl={popupImage}
          onClose={() => handlePopupImage(null)}
          altText="User uploaded content"
        />
      )}
    </div>
  );
};

ChatBox.propTypes = {
  messageHistory: PropTypes.array.isRequired,
  speakText: PropTypes.func.isRequired,
  copyTextToClipboard: PropTypes.func.isRequired,
  stripHTML: PropTypes.func.isRequired,
  escapeHtml: PropTypes.func.isRequired,
};

export default ChatBox;