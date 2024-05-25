import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { marked } from 'marked';

const ChatBox = ({ messageHistory, speakText, copyTextToClipboard, stripHTML, escapeHtml, removeMarkdown }) => {
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
      {messageHistory.map((message, index) => {
        const textNoHtml = stripHTML(message.text_display);
        const textNoHtmlEscaped = escapeHtml(textNoHtml);
        const textSpeak = encodeURIComponent(textNoHtmlEscaped);

        return (
          <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}>
            <div dangerouslySetInnerHTML={{ __html: marked(message.text_display) }}></div>
            <hr />
            <button onClick={() => speakText(textSpeak)}>🔊</button>
            <button onClick={() => copyTextToClipboard(textSpeak)}>📋</button>
          </div>
        );
      })}
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