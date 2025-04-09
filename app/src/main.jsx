import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Keep your global styles
import App from './App'; // Import the main App component

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> {/* Render the App component here */}
  </StrictMode>,
);