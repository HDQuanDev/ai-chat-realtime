import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (root !== null) {
  createRoot(root).render(
    <Router>
      <Routes>
        <Route path="/share/:id" element={<App />} />
        <Route path="/" element={<App />} />
        <Route path="/topic/:id" element={<App />} />
      </Routes>
    </Router>
  );
}