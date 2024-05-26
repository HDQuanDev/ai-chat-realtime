import React, { useEffect, useState } from 'react';
import { Notification_Sound, Click_Sound, Success_Sound, Error_Sound} from './SoundEffects';
const PwaPrompt = () => {
  const [isClosed, setIsClosed] = useState(false);

useEffect(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    if (isClosed) return;

    const main_click = document.getElementById('root');
    const pwaPrompt = document.getElementById('pwa-prompt');
    const installButton = document.getElementById('install-button');
    const closeButton = document.getElementById('close-button');
    var show = false;
    if(main_click) {
      main_click.addEventListener('click', () => {
        e.preventDefault();
        if(show) return;
        show = true;
        setTimeout(() => {
          Notification_Sound();
          pwaPrompt.style.top = '20px';
        }, 2000);
      });
    }
    main_click.addEventListener('click', () => {
    if(installButton) {
      installButton.addEventListener('click', () => {
        e.preventDefault();
        Click_Sound();
        pwaPrompt.style.top = '-100px';
        e.prompt();
        e.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            Success_Sound();
          } else {
            Error_Sound();
          }
        });
      });
    }

    if(closeButton) {
      closeButton.addEventListener('click', () => {
        Click_Sound();
        pwaPrompt.style.top = '-100px';
        setIsClosed(true);
      });
    }
  });
});
}, [isClosed]);

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