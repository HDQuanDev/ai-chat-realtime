import React, { useEffect, useState, useCallback } from 'react';
import { Notification_Sound, Click_Sound, Success_Sound, Error_Sound } from './SoundEffects';
import 'tailwindcss/tailwind.css';

const PwaPrompt = () => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    Click_Sound();
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      outcome === 'accepted' ? Success_Sound() : Error_Sound();
    } catch (error) {
      console.error('Installation failed', error);
    }
    setDeferredPrompt(null);
    setShow(false);
  }, [deferredPrompt]);

  const handleClose = useCallback(() => {
    Click_Sound();
    setShow(false);
    const now = new Date().getTime();
    localStorage.setItem('pwa-prompt-dismissed-timestamp', now);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleMainClick = () => {
      const now = new Date().getTime();
      const dismissedTimestamp = localStorage.getItem('pwa-prompt-dismissed-timestamp');
      const oneHour = 60 * 60 * 1000;

      if (show || !deferredPrompt || (dismissedTimestamp && now - dismissedTimestamp < oneHour)) return;

      setTimeout(() => {
        Notification_Sound();
        setShow(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    document.getElementById('root')?.addEventListener('click', handleMainClick);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.getElementById('root')?.removeEventListener('click', handleMainClick);
    };
  }, [show, deferredPrompt]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start mt-6">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 mx-4 max-w-sm w-full transition-transform duration-500 ease-in-out transform ${show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
        <p className="text-gray-800 dark:text-white mb-4">Cài đặt ứng dụng để sử dụng đầy đủ chức năng!</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleInstall}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out hover:-translate-y-1"
          >
            Cài đặt
          </button>
          <button
            onClick={handleClose}
            className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out hover:-translate-y-1"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaPrompt;
