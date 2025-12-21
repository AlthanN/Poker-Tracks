import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { inject, pageview } from '@vercel/analytics';

// Initialize Vercel Web Analytics for the client
inject({ framework: 'react' });

// Record a single pageview / site visit on initial load
try { pageview({ path: window.location.pathname }); } catch (e) { print(e) }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
