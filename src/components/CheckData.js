import React, { useEffect } from "react";
import { getDataFromLocalStorage, setDataToLocalStorage } from "./Utils";



const CheckData = () => {
    const Sound_Effects = getDataFromLocalStorage('sound-effects');
    if (Sound_Effects == null) {
      setDataToLocalStorage('sound-effects', true);
    }
    
    if (getDataFromLocalStorage('install_v2') === null || getDataFromLocalStorage('install_v2') === false || getDataFromLocalStorage('install_v2') === undefined) {
      localStorage.clear();
      setDataToLocalStorage('install_v2', true);
      window.location.reload(true);
    }

    useEffect(() => {
    const idUser = getDataFromLocalStorage('id_user');
    if (idUser !== null && idUser !== '' && idUser !== undefined) {
      fetch(`${process.env.REACT_APP_API_URL}/CheckChatExist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat_id: idUser }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.status !== 'success') {
          localStorage.clear();
          window.location.reload(true);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  }, []);
    return (
        <div>
        </div>
    );
};

export default CheckData;