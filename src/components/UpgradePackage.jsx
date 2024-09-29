import React from "react";
import { Click_Sound } from "./SoundEffects";

const UpgradePackage = ({ onUpgrade }) => {
  const handleUpgrade = () => {
    onUpgrade();
    Click_Sound();
  };
  return (
    <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-xl shadow-lg m-4 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div>
          <h3 className="font-bold text-xl mb-2">Dự Án Phi Lợi Nhuận</h3>
          <p className="text-sm text-indigo-100 dark:text-indigo-200">
            Đây là một dự án phi lợi nhuận được sáng lập và điều hành bởi{" "}
            <a
              href="https://www.facebook.com/quancp72h"
              className="underline hover:text-white transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              HDQuanDev
            </a>
          </p>
        </div>
        <button
          onClick={handleUpgrade}
          className="bg-white text-indigo-600 font-bold py-2 px-6 rounded-full shadow-md hover:bg-indigo-100 dark:hover:bg-indigo-200 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-400"
        >
          Ủng Hộ
        </button>
      </div>
    </div>
  );
};

export default UpgradePackage;
