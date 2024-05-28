import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'; // Đảm bảo rằng CSS đã được import

const CheckServer = () => {
  const [status, setStatus] = useState('loading');
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await axios.get('https://cloud.qdevs.tech/ai/check.php');
        if (response.data.status === 'online') {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        console.error('Error checking server status:', error);
        setStatus('offline');
    }
};

// Initial check
const initialCheck = async () => {
  await checkServerStatus();
  setInitialCheckDone(true);
};

initialCheck();

// Check server status every 10 seconds
const interval = setInterval(() => {
  if (initialCheckDone && status === 'online') {
    checkServerStatus();
  }
}, 10000);

// Clean up interval on component unmount
return () => clearInterval(interval);
}, [initialCheckDone, status]);

const renderOverlayMessage = () => {
if (status === 'loading') {
  const message = 'Đang kiểm tra trạng thái trực tuyến của server...';
  return (
    <>
      {message.split('').map((char, index) => (
        <span key={index}>{char}</span>
      ))}
    </>
  );
} else if (status === 'offline') {
  return 'Không thể kết nối đến server, vui lòng load lại trang';
}
return null;
};

return (
<div>
  {(status === 'loading' || (status === 'offline' && !initialCheckDone)) && (
    <div
      id="check-server-overlay"
      className={`check-server ${status === 'offline' ? 'offline' : ''}`}
    >
      {renderOverlayMessage()}
    </div>
  )}
  {status === 'offline' && initialCheckDone && (
    <div id="check-server-overlay" className="check-server offline">
      Không thể kết nối đến server, vui lòng load lại trang
    </div>
  )}
</div>
);
};

export default CheckServer;
