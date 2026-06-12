import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
window.bootstrap = bootstrap
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Global modal cleanup: ensure body overflow/class are cleared when no modals are visible
function safeClearModalBodyState() {
  try {
    const anyShown = document.querySelectorAll('.modal.show').length > 0;
    if (!anyShown) {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
  } catch {
    // ignore
  }
}

// Listen for Bootstrap modal hidden event to clear body state when appropriate
document.addEventListener('hidden.bs.modal', () => {
  safeClearModalBodyState();
});

// On load, if body is locked but no modal is visible, clear stale state
window.addEventListener('load', () => {
  setTimeout(() => safeClearModalBodyState(), 200);
});
