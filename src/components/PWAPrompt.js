import React, { useEffect } from 'react';

const PwaPrompt = () => {
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      const pwaPrompt = document.getElementById('pwa-prompt');
      const installButton = document.getElementById('install-button');
      const closeButton = document.getElementById('close-button');

      setTimeout(() => {
        pwaPrompt.style.top = '20px';
      }, 3000);

      installButton.addEventListener('click', () => {
        pwaPrompt.style.top = '-100px';
        e.prompt();
        e.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
        });
      });

      closeButton.addEventListener('click', () => {
        pwaPrompt.style.top = '-100px';
      });
    });
  }, []);

  return (
    <div id="pwa-prompt" className="pwa-prompt">
      <div className="pwa-content">
        <p>Cài đặt ứng dụng để sử dụng đầy đủ chức năng!</p>
        <button id="install-button">Cài đặt</button>
        <button id="close-button">Đóng</button>
      </div>
    </div>
  );
};

export default PwaPrompt;
