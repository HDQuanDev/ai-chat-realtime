import { useEffect, useState } from 'react';

const useDarkMode = () => {
  // Step 1: Initialize state with localStorage value or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('dark-mode');
    return savedMode !== null ? savedMode === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Step 2: Effect for updating state based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
      localStorage.setItem('dark-mode', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Step 3: Effect for persisting state changes to localStorage
  useEffect(() => {
    localStorage.setItem('dark-mode', isDarkMode);
  }, [isDarkMode]);

  return isDarkMode;
};

export default useDarkMode;