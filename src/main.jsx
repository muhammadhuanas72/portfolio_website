import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Sign-in links that land on the homepage (Supabase falls back to the site URL when the
// requested redirect isn't on its allow-list) belong to the admin page: pass the token on.
if (/(^|[#&])(access_token|error_description)=/.test(window.location.hash)) {
  window.location.replace(`/admin.html${window.location.hash}`)
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
