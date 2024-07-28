import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

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
      className="h-full overflow-auto p-4 space-y-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-300 relative"
    >
      <div className="flex flex-col space-y-4 p-3 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200 dark:scrollbar-thumb-indigo-400 dark:scrollbar-track-gray-700 scrollbar-thumb-rounded scrollbar-track-rounded leading-relaxed text-base/loose" id="add-message">
        {messageHistory.length === 0 ? (
          <div className="flex items-center justify-center flex-grow">
            <div className="text-center p-8 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-indigo-900 rounded-lg shadow-2xl max-w-md transform transition-all duration-300 hover:scale-105 border-2 border-blue-200 dark:border-indigo-600">
              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Chào mừng!</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Tôi là mô hình ngôn ngữ tự nhiên được huấn luyện để trả lời các câu hỏi về mọi thứ. 
                Nếu bạn có bất kỳ câu hỏi nào, hãy hỏi tôi!
              </p>
              {checkTopicAi === false ? (
                <p className="text-red-600 dark:text-red-300 text-xl mt-4">Vui lòng chọn đoạn chat có sẵn hoặc tạo đoạn chat mới để bắt đầu trò chuyện với AI.</p>
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
              <div key={index} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} mb-4`}>
                <div className={`flex items-center mb-1 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-200 dark:bg-blue-500 ml-2' : 'bg-green-500 mr-2'}`}>
                    {message.sender === 'user' ? '👤' : '🤖'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {message.sender === 'user' ? 'User' : 'AI'}
                  </span>
                </div>
                <div className={`
                  max-w-[95%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[65%]
                `}>
                  <div className={`px-4 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out
                    ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900 dark:from-blue-600 dark:to-indigo-700 hover:from-blue-300 hover:to-indigo-500 dark:text-white dark:hover:from-blue-700 dark:hover:to-indigo-800'
                      : 'bg-gradient-to-r from-white to-gray-100 text-gray-800 dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700'
                    } hover:shadow-lg`}>
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
                              onClick={() => setPopupImage(message.image_url)}
                              className="hidden group-hover:block bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition-all duration-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                            >
                              Xem full
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: processedHtml }} className="prose prose-sm max-w-none dark:prose-invert text-base" />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button 
                        onClick={() => speakText(textSpeak)} 
                        className="text-xs bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 dark:from-green-600 dark:to-green-800 dark:hover:from-green-500 dark:hover:to-green-700 text-white px-2 py-1 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
                        title='Đọc tin nhắn'
                      >
                        🔊 Nghe
                      </button>
                      <button 
                        onClick={() => copyTextToClipboard(textSpeak)} 
                        className="text-xs bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 dark:from-purple-600 dark:to-pink-700 dark:hover:from-purple-500 dark:hover:to-pink-600 text-white px-2 py-1 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
                        title='Sao chép tin nhắn'
                      >
                        📋 Sao Chép
                      </button>
                    </div>
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
          onClose={() => setPopupImage(null)}
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