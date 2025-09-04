import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminApp from './AdminApp.tsx';
import { AdminDemo } from './AdminDemo.tsx';
import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/demo" element={<AdminDemo />} />
        <Route path="*" element={<AdminApp />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
