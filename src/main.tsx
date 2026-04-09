import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const ErrorDisplay = () => {
  return <div id="err-display" style={{color:'red', padding:'20px'}}></div>;
}

window.onerror = function(message, source, lineno, colno, error) {
  document.body.innerHTML = `<div style="padding: 20px; color: red; background: white; z-index: 9999; position: absolute; top:0; left:0; right:0; bottom:0;">
    <h1>Runtime Error</h1>
    <pre>${message}</pre>
    <pre>${error?.stack}</pre>
  </div>`;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
