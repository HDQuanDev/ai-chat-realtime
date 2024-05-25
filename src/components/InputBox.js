import React from 'react';

const InputBox = ({ sendMessage, startDictation, stopDictation, stopSpeaking }) => {
  return (
    <div id="input-box">
      <input type="text" id="user-input" placeholder="Type a message" onKeyDown={(event) => {
        if (event.key === 'Enter') {
          sendMessage();
        }
      }} />
      <button onClick={sendMessage} id="send">Send</button>
      <button onClick={startDictation} id="mic">🎤</button>
      <button id="stop-listening" style={{ display: 'none' }} onClick={stopDictation}>Dừng Nghe</button>
      <button id="stop-speaking" style={{ display: 'none' }} onClick={stopSpeaking}>Dừng Nói</button>
    </div>
  );
};

export default InputBox;
