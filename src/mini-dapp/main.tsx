import React from 'react';
import ReactDOM from 'react-dom/client';
import MiniApp from './MiniApp';
import './styles/mini-app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MiniApp />
  </React.StrictMode>,
);