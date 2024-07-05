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

  // Trích xuất các đoạn mã và chèn nút "Copy Code"
  const insertCopyButtons = (html) => {
    const codeSnippetRegex = /<pre><code class="language-([a-zA-Z]+)">([\s\S]*?)<\/code><\/pre>/g;
    let match;
    let processedHtml = html;
    
    while ((match = codeSnippetRegex.exec(html)) !== null) {
      const language = match[1];
      const snippet = match[2];
      const codeBlock = match[0];
      const copyButton = `
        <div class="code-container">
          <div class="code-header">
            <span class="code-language">${language}</span>
            <button class="copy-code-button" data-code="${encodeURIComponent(snippet)}">📋 Sao chép mã</button>
          </div>
          ${codeBlock}
        </div>`;
      processedHtml = processedHtml.replace(codeBlock, copyButton);
    }

    return processedHtml;
  };

  // Thêm sự kiện click cho các nút "Copy Code"
  useEffect(() => {
    const handleCopyButtonClick = (event) => {
      if (event.target.classList.contains('copy-code-button')) {
        const code = (event.target.getAttribute('data-code'));
        copyTextToClipboard(code);
      }
    };

    document.addEventListener('click', handleCopyButtonClick);

    return () => {
      document.removeEventListener('click', handleCopyButtonClick);
    };
  }, [copyTextToClipboard]);

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
          let text_display;
          if(message.sender === 'user') {
             text_display = message.text_display.replace(/\n/g, "<br>");
          } else {
             text_display = message.text_display;
          }

          const processedHtml = insertCopyButtons(marked(text_display));

          return (
            <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}>
              <div dangerouslySetInnerHTML={{ __html: processedHtml }}></div>
              <hr />
              <button onClick={() => speakText(textSpeak)} title='Đọc tin nhắn' alt='Đọc tin nhắn'>🔊 Nghe</button>
              <button onClick={() => copyTextToClipboard(textSpeak)} title='Sao chép tin nhắn' alt='Sao chép tin nhắn'>📋 Sao Chép</button>
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
