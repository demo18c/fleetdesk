// ============================================================
// client/src/main.jsx — browser entry point
// Mounts <App /> into the #root div from index.html and pulls in
// Bootstrap's CSS once, globally.
// ============================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css'; // theme overrides, must come after Bootstrap
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
