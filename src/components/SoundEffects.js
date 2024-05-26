import { getDataFromLocalStorage } from "./Utils";

const shouldPlaySound = () => {
  const soundEffects = getDataFromLocalStorage('sound-effects');
  return soundEffects;
};

export const Send_Message = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/happy-pop-2-185287.mp3');
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

let sound_typing = null;

export const Typing_Message = (stop = false) => {
  if (!shouldPlaySound()) return;
  if (!sound_typing) {
    sound_typing = new Audio('./assets/audio/writing-a-text-message-41141.mp3');
    sound_typing.volume = 0.5;
    sound_typing.loop = true;
  }

  if (stop) {
    sound_typing.pause();
  } else {
    sound_typing.play();
  }
};

export const Receive_Message = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/new-notification-7-210334.mp3');
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

export const Notification_Sound = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/notification-sound-7062.mp3');
  sound.volume = 0.5;
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

export const On_Off_Sound = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/interface-button-154180.mp3');
  sound.volume = 0.7;
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

export const Click_Sound = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/mouse-click-153941.mp3');
  sound.volume = 0.2;
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

export const Open_Sound = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/open-doors-114615.mp3');
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

export const Close_Sound = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/door-close-85789.mp3');
  sound.volume = 0.4;
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

export const Success_Sound = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/success-1-6297.mp3');
  sound.volume = 0.3;
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

export const Error_Sound = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/error-call-to-attention-129258.mp3');
  sound.volume = 0.3;
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
};

export const Slide_Down_Sound = (stop = false) => {
  if (!shouldPlaySound()) return;
  const sound = new Audio('./assets/audio/089048_woosh-slide-in-88642.mp3');
    sound.volume = 0.2;
  if (stop) {
    sound.pause();
  } else {
    sound.play();
  }
}