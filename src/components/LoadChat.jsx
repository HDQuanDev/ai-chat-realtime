import React, { useEffect, useState, useRef } from "react";
import { showToast } from "./Toast";

const LoadChat = ({ setMessageHistory }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialMessageShown = useRef(false);
  const eventSourceRef = useRef(null);
  const [activeChat, setActiveChat] = useState(
    localStorage.getItem("active_chat")
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentActiveChat = localStorage.getItem("active_chat");
      if (currentActiveChat !== activeChat) {
        setLoading(true);
        setError(null);
        setActiveChat(currentActiveChat);
      }
    }, 100); // Kiểm tra mỗi giây một lần

    return () => clearInterval(intervalId);
  }, [activeChat]);

  useEffect(() => {
    const chatId = localStorage.getItem("active_chat");

    if (!chatId) {
      setLoading(false);
      return; // Không làm gì nếu không có id_user
    }

    const timeoutDuration = 5 * 60 * 1000; // 5 minutes
    let timeoutId;
    let load_count = 0;

    const run = () => {
      const intervalId = setInterval(() => {
        const get_active_chat = localStorage.getItem("active_chat");
        if (
          get_active_chat !== null &&
          get_active_chat !== "" &&
          get_active_chat !== undefined
        ) {
          if (load_count === 0) {
            setLoading(true);
            load_count = 1;
          }
          setError(null);
          connectEventSource();
          clearInterval(intervalId); // Sử dụng intervalId để dừng interval
        }
      }, 1000);
    };

    const connectEventSource = () => {
      eventSourceRef.current = new EventSource(
        `${process.env.REACT_APP_API_URL}/SyncData?chat_id=${chatId}`
      );

      eventSourceRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.status === "success") {
          if (response.code === 304) {
          } else if (response.code === 404) {
          } else {
            const data = response.data;

            const formattedMessages = data.map((item) => ({
              sender: item.sender === "user" ? "user" : "ai",
              image_url: item.file_url,
              text_display: item.message,
            }));

            const json = JSON.stringify(formattedMessages);
            const data_goc = localStorage.getItem("messageHistorySave");

            if (!initialMessageShown.current) {
              showToast(
                "Thành công",
                "Đã kết nối thành công với máy chủ",
                "success"
              );
              initialMessageShown.current = true;
            }

            if (!data_goc || json.length !== data_goc.length) {
              localStorage.setItem("messageHistorySave", json);
              setMessageHistory(formattedMessages);
            }
          }
          setLoading(false);
        } else {
          handleError("Lỗi khi lấy dữ liệu từ server: " + response.message);
          if (response.code === 404) {
          }
        }
      };

      eventSourceRef.current.onerror = () => {
        handleError("Lỗi kết nối, vui lòng tải lại trang để thử lại");

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };

      // Set a timeout to disconnect and reconnect the EventSource after the specified duration
      timeoutId = setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          run(); // Reconnect after timeout
        }
      }, timeoutDuration);
    };

    const handleError = (errorMessage) => {
      setError(errorMessage);
      setLoading(false);
      showToast("Lỗi", errorMessage, "error");
      if (eventSourceRef.current) eventSourceRef.current.close();
    };

    run();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      clearTimeout(timeoutId);
    };
  }, [activeChat, setMessageHistory]);

  if (!localStorage.getItem("id_user")) {
    return null; // Không render gì nếu không có id_user
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-50">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
            Đang kết nối với máy chủ...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-50">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg text-center max-w-sm">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadChat;
