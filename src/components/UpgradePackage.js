import React from 'react';

const UpgradePackage = ({ onUpgrade }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex justify-between items-center rounded-lg shadow-md m-3">
      <div>
        <h3 className="font-bold text-lg">Dự Án Phi Lợi Nhuận</h3>
        <p className="text-sm">Đây là 1 dự án phi lợi nhuận được sáng lập và điều hành bới <a href="https://www.facebook.com/quancp72h" className="underline">HDQuanDev</a></p>
      </div>
      <button
        onClick={onUpgrade}
        className="bg-white text-yellow-500 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-100 transition duration-300"
      >
        Ủng Hộ
      </button>
    </div>
  );
};

export default UpgradePackage;
