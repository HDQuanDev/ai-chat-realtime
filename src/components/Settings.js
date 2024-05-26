import React, { useState, useEffect } from 'react';
import '../setting.css';
import { On_Off_Sound, Open_Sound, Close_Sound } from './SoundEffects';
import { getDataFromLocalStorage, setDataToLocalStorage } from './Utils';

const SettingsModal = ({ isOpen, onClose, isDarkMode, toggleDarkMode, isSoundEffect, toggleSoundEffect }) => {
  if (!isOpen) return null;
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="close-button">✖️</button>
        </div>
        <div className="settings-modal-content">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isDarkMode} 
              onChange={toggleDarkMode} 
            />
            <span className="slider round"></span>
          </label>
          <span className="dark-mode-status">Dark Mode {isDarkMode ? "Enabled" : "Disabled"}</span>
        </div><br/>
        <div className="settings-modal-content">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isSoundEffect} 
              onChange={toggleSoundEffect} 
            />
            <span className="slider round"></span>
          </label>
          <span className="dark-mode-status">Sound Effect {isSoundEffect ? "Enabled" : "Disabled"}</span>
        </div><br /><hr />
        <div className="settings-modal-header">
          <h2>Change Log 0.6.Beta</h2>
        </div>
        <div className="settings-modal-content">
            <p>1. Fix bug</p>
            </div>
        <div className="settings-modal-content">
            <p>2. Add sound effect</p>
            </div>
        <div className="settings-modal-content">
            <p>3. Add setting</p>
        </div>
        <div className="settings-modal-content">
            <p>4. Add button down chat</p>
        </div>
            
        <div className='settings-modal-content'>
            <p style={{ textAlign: 'center' }}>Developed by <a href="https://www.facebook.com/quancp72h" target="_blank" style={{ color: 'red', textDecoration: 'none' }} rel="noreferrer">Hứa Đức Quân</a></p>
        </div>
      </div>
    </div>
  );
};

const SettingsButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSoundEffect, setIsSoundEffect] = useState(false);

  useEffect(() => {
    // Check if body already has dark-mode class
    setIsDarkMode(document.body.classList.contains('dark-mode'));

    // Get sound effects status from localStorage
    const soundEffects = getDataFromLocalStorage('sound-effects');
    setIsSoundEffect(soundEffects);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkModeEnabled = document.body.classList.contains('dark-mode');
          setIsDarkMode(isDarkModeEnabled);
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setDataToLocalStorage('sound-effects', isSoundEffect);
  }, [isSoundEffect]);

  const toggleSoundEffect = () => {
    setIsSoundEffect(prevMode => {
      const newMode = !prevMode;
      On_Off_Sound();
      return newMode;
    });
  };

  const openModal = () => {
    Open_Sound();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    Close_Sound();
    setIsModalOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      On_Off_Sound();
      return newMode;
    });
  };

  return (
    <>
      <button className="settings-button" onClick={openModal}>⚙️</button>
      <SettingsModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        isSoundEffect={isSoundEffect} 
        toggleSoundEffect={toggleSoundEffect} 
      />
    </>
  );
};

export default SettingsButton;
