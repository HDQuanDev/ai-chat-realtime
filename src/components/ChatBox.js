import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { marked } from 'marked';

const ChatBox = ({ messageHistory, speakText, copyTextToClipboard, stripHTML, escapeHtml }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messageHistory]);

  

  // Đảm bảo messageHistory luôn là một mảng
  if (!Array.isArray(messageHistory)) {
    messageHistory = [];
  }

  return (
    <div id="chat-box">
      {messageHistory.length === 0 ? (
        <div className="message ai-message">
          <div>Tôi là mô hình ngôn ngữ tự nhiên được huấn luyện để trả lời các câu hỏi về mọi thứ. Nếu bạn có bất kỳ câu hỏi nào, hãy hỏi tôi!</div>
        </div>
      ) : (
        messageHistory.map((message, index) => {
          const textNoHtml = stripHTML(message.text_display);
          const textNoHtmlEscaped = escapeHtml(textNoHtml);
          const textSpeak = encodeURIComponent(textNoHtmlEscaped);
          if(message.sender === 'user') {
            var text_display = message.text_display.replace(/\n/g, "<br>");
          } else {
            var text_display = message.text_display;
          }
          return (
            <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}>
              <div dangerouslySetInnerHTML={{ __html: marked(text_display) }}></div>
              <hr />
              <button onClick={() => speakText(textSpeak)}>🔊</button>
              <button onClick={() => copyTextToClipboard(textSpeak)}>📋</button>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

ChatBox.propTypes = {
  messageHistory: PropTypes.array.isRequired,
  speakText: PropTypes.func.isRequired,
  copyTextToClipboard: PropTypes.func.isRequired,
  stripHTML: PropTypes.func.isRequired,
  escapeHtml: PropTypes.func.isRequired,
  removeMarkdown: PropTypes.func.isRequired,
};

export default ChatBox;