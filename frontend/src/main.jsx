import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')||document.body).render(
	<React.StrictMode>
		<ThemeProvider>
			<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
				<App />
			</BrowserRouter>
		</ThemeProvider>
	</React.StrictMode>
)
