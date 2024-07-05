// MessageContext.js
import React, { createContext, useState, useEffect } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messageHistory, setMessageHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('messageHistorySave')) || [];
  });

  useEffect(() => {
    localStorage.setItem('messageHistorySave', JSON.stringify(messageHistory));
  }, [messageHistory]);

  const deleteAllMessages = () => {
    setMessageHistory([]);
    localStorage.removeItem('messageHistorySave');
  };

  return (
    <MessageContext.Provider value={{ messageHistory, setMessageHistory, deleteAllMessages }}>
      {children}
    </MessageContext.Provider>
  );
};
