import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Blur buttons after click so :focus styles don't persist on hover
document.addEventListener('mouseup', (e) => {
  if (e.target.closest('button')) e.target.closest('button').blur();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
