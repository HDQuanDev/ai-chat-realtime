import { getDataFromLocalStorage } from "./Utils";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};

const loadAudioFile = async (key, src) => {
  try {
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBuffers[key] = audioBuffer;
  } catch (error) {
    console.error(`Error loading audio file ${src}:`, error);
  }
};

const shouldPlaySound = () => {
  const soundEffects = getDataFromLocalStorage('sound-effects');
  return soundEffects;
};

const playSound = (key, options = {}) => {
  if (!shouldPlaySound()) return;
  const audioBuffer = audioBuffers[key];
  if (!audioBuffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = audioContext.createGain();
  if (options.volume !== undefined) {
    gainNode.gain.value = options.volume;
  } else {
    gainNode.gain.value = 1;
  }

  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.start(0);
};

const audioFiles = {
  'happy-pop': './assets/audio/happy-pop-2-185287.mp3',
  'typing': './assets/audio/writing-a-text-message-41141.mp3',
  'notification': './assets/audio/new-notification-7-210334.mp3',
  'notif-sound': './assets/audio/notification-sound-7062.mp3',
  'interface-button': './assets/audio/interface-button-154180.mp3',
  'mouse-click': './assets/audio/mouse-click-153941.mp3',
  'open-doors': './assets/audio/open-doors-114615.mp3',
  'door-close': './assets/audio/door-close-85789.mp3',
  'success': './assets/audio/success-1-6297.mp3',
  'error': './assets/audio/error-call-to-attention-129258.mp3',
  'slide-down': './assets/audio/089048_woosh-slide-in-88642.mp3',
};

// Preload all audio files
Object.keys(audioFiles).forEach(key => {
  loadAudioFile(key, audioFiles[key]);
});

export const Send_Message = () => playSound('happy-pop');

let sound_typing = null;

export const Typing_Message = (stop = false) => {
  if (!shouldPlaySound()) return;
  if (!sound_typing) {
    sound_typing = audioBuffers['typing'];
  }

  if (stop) {
    // To stop the looping sound, we'll need to disconnect or stop the source node
    if (sound_typing.source) {
      sound_typing.source.stop();
      sound_typing.source = null;
    }
  } else {
    if (!sound_typing.source) {
      const source = audioContext.createBufferSource();
      source.buffer = sound_typing;
      source.loop = true;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.5;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(0);
      sound_typing.source = source;
    }
  }
};

export const Receive_Message = () => playSound('notification');

export const Notification_Sound = () => playSound('notif-sound', { volume: 0.5 });

export const On_Off_Sound = () => playSound('interface-button', { volume: 0.7 });

export const Click_Sound = () => playSound('mouse-click', { volume: 0.2 });

export const Open_Sound = () => playSound('open-doors');

export const Close_Sound = () => playSound('door-close', { volume: 0.4 });

export const Success_Sound = () => playSound('success', { volume: 0.3 });

export const Error_Sound = () => playSound('error', { volume: 0.3 });

export const Slide_Down_Sound = () => playSound('slide-down', { volume: 0.2 });
