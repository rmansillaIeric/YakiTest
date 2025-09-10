import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css';
import './index.css';
import InitialScreen from './InitialScreen';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InitialScreen/>    
  </StrictMode>,
)
