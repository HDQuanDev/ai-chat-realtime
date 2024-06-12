import React from 'react';
// import { getDataFromLocalStorage } from './Utils';
import {showToast} from './Toast';

const ShareButton = ({ messageHistory }) => {
  const handleShare = async () => {
    try {
      // const id_user = getDataFromLocalStorage('id_user');
      // const url = `https://api.quanhd.net/ai/share.php?id_user=${id_user}`;
      // const xhr = new XMLHttpRequest();
      // xhr.open('POST', url, true);
      // xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      // xhr.setRequestHeader('Referer', 'ai.qdevs.tech');
      // xhr.onreadystatechange = function () {
      //   if (xhr.readyState === XMLHttpRequest.DONE) {
      //     if (xhr.status === 200) {
      //       const responseData = JSON.parse(xhr.responseText);
      //       const { url: sharedUrl } = responseData;
      //       const fullUrl = `${window.location.origin}${sharedUrl}`;
      //       navigator.clipboard.writeText(fullUrl);
      //       alert(`Link copied to clipboard: ${fullUrl}`);
      //     } else {
      //       throw new Error('Failed to share the message history.');
      //     }
      //   }
      // };
      // xhr.send(JSON.stringify({ messageHistory }));
      showToast('Lỗi', 'Tính năng chia sẻ đang được phát triển. Vui lòng thử lại sau.','error');
    } catch (error) {
      showToast('Lỗi', 'Tính năng chia sẻ đang được phát triển. Vui lòng thử lại sau.','error');
    }
  };

  return (
    <button className="share-button" onClick={handleShare}>
      Chia sẻ
    </button>
  );
};

export default ShareButton;
