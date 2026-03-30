import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { LandingPage } from './pages/LandingPage'
import { ScanningPage } from './pages/ScanningPage'
import { WorkspacePage } from './pages/WorkspacePage'

function Pages() {
  const { page } = useApp()

  switch (page) {
    case 'scanning':
      return <ScanningPage />
    case 'workspace':
      return <WorkspacePage />
    default:
      return <LandingPage />
  }
}

export default function App() {
  return (
    <AppProvider>
      <Pages />
    </AppProvider>
  )
}
