import toastr from 'toastr';
export const stripHTML = (html) => { const resutl = html.replace(/<[^>]*>/g, ''); return resutl; };
export const escapeHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
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

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.onstart = () => document.getElementById('stop-speaking').style.display = 'inline';
  utterance.onend = () => document.getElementById('stop-speaking').style.display = 'none';
  utterance.onerror = () => document.getElementById('stop-speaking').style.display = 'none';
  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    document.getElementById('stop-speaking').style.display = 'none';
  }
};


export const stopDictation = () => {
  if (window.recognition) {
    window.recognition.stop();
    document.getElementById('stop-listening').style.display = 'none';
  }
};

export const copyTextToClipboard = (text) => {
    var text = decodeURIComponent(text);
    var text = decodeHtmlEntities(text);
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        toastr.success('Đã sao chép nội dung vào clipboard.');
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