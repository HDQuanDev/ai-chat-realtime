import toastr from 'toastr';
import { Click_Sound, Success_Sound, Error_Sound } from './SoundEffects';

export const stripHTML = (html) => {
    const resutl = html.replace(/<[^>]*>/g, '');
    return resutl;
};
export const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
};
export const removeMarkdown = (text) => {
    const regex = /(\*{1,2}|_{1,2}|`{1,3}|~~|\[\[|\]\]|!\[|\]\(|\)|#{1,6}|>|-\s|\+\s|\d+\.\s|\|)/g;
    return text.replace(regex, '');
};

export const disableButton = (id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = true;
};

export const enableButton = (id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = false;
};

export const speakText = (text) => {
    text = decodeURIComponent(text);
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    Click_Sound();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.onstart = () => {
        document.getElementById('stop-speaking').style.display = 'inline';
        document.getElementById('mic').style.display = 'none';
    };
    utterance.onend = () => {
        document.getElementById('stop-speaking').style.display = 'none';
        document.getElementById('mic').style.display = 'inline';
    };
    utterance.onerror = () => {
        document.getElementById('stop-speaking').style.display = 'none';
        document.getElementById('mic').style.display = 'inline';
    };
    window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
        Click_Sound();
        window.speechSynthesis.cancel();
        document.getElementById('stop-speaking').style.display = 'none';
        document.getElementById('mic').style.display = 'inline';
    }
};



export const copyTextToClipboard = (text) => {
    var text_format, text_copy;
    text_copy = decodeURIComponent(text);
    text_format = decodeHtmlEntities(text_copy);
    var textArea = document.createElement("textarea");
    textArea.value = text_format;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        if (successful) {
            Success_Sound();
            toastr.success('Đã sao chép nội dung vào clipboard.');
        } else {
            Error_Sound();
            toastr.error('Không thể sao chép nội dung vào clipboard.', 'Lỗi');
        }
    } catch (err) {
        toastr.error('Không thể sao chép nội dung vào clipboard.', 'Lỗi');
    }

    document.body.removeChild(textArea);
}

export const decodeHtmlEntities = (str) => {
    str = str.replace(/&amp;/g, '&');
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&quot;/g, '"');
    str = str.replace(/&#39;/g, "'");
    return str;
}

export const check_is_mobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
        return true;
    }else{
        return false;
    }
}

export const getDataFromLocalStorage = (key) => {
    const data = localStorage.getItem(key);
    try {
        return JSON.parse(data);
    } catch (e) {
     return data;
    }
}

export const setDataToLocalStorage = (key, data) => {
    if (typeof data === 'object') {
        localStorage.setItem(key, JSON.stringify(data));
    }
    localStorage.setItem(key, data);
}

export const deleteDataFromLocalStorage = (key) => {
    localStorage.removeItem(key);
}

export const randomString = (length) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}