import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import ProjectPage from './pages/ProjectPage';
import ReaderPage from './pages/ReaderPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/edit" element={<ProjectPage />} />
        <Route path="/docs" element={<ReaderPage />} />
        <Route path="/docs/*" element={<ReaderPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
