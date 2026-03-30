import React, { useState } from 'react'
import {
  Bot, Settings, RefreshCw, FolderOpen, X,
  Moon, Sun, Trash2, Info, ChevronRight,
} from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { ChatPanel } from '../components/layout/ChatPanel'
import { SourcePanel } from '../components/layout/SourcePanel'
import { ChatProvider } from '../context/ChatContext'
import { useApp } from '../context/AppContext'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Tooltip } from '../components/ui/Tooltip'

function SettingsDrawer({ onClose }) {
  const { folderPath, skipped, dispatch, navigate } = useApp()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div
        className="animate-slide-right"
        style={{
          position: 'relative',
          width: '320px',
          height: '100%',
          background: '#141720',
          borderLeft: '1px solid #1e2330',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #1e2330',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Settings size={16} color="#6e8efb" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', flex: 1 }}>Settings</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Current folder */}
          <section>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Current Folder
            </div>
            <div
              style={{
                background: '#0d0f14',
                border: '1px solid #1e2330',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FolderOpen size={13} color="#6e8efb" />
              <span style={{ fontSize: '11px', color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {folderPath || 'No folder'}
              </span>
            </div>

            <button
              id="rescan-btn"
              onClick={() => { dispatch({ type: 'RESET' }); navigate('landing') }}
              style={{
                marginTop: '8px',
                width: '100%',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                padding: '8px',
                background: 'rgba(110,142,251,0.08)',
                border: '1px solid rgba(110,142,251,0.15)',
                borderRadius: '6px',
                color: '#6e8efb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(110,142,251,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(110,142,251,0.08)')}
            >
              <RefreshCw size={12} />
              Change folder / Re-scan
            </button>
          </section>

          {/* Skipped files */}
          {skipped.length > 0 && (
            <section>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                Skipped Files ({skipped.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {skipped.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 10px',
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.15)',
                      borderRadius: '5px',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ color: '#f59e0b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.path}
                    </div>
                    <div style={{ color: '#64748b', marginTop: '2px' }}>{s.reason}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* About */}
          <section>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              About
            </div>
            <div
              style={{
                padding: '10px 12px',
                background: '#0d0f14',
                border: '1px solid #1e2330',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#64748b',
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={13} color="#6e8efb" />
                Nanobot v1.0.0
              </div>
              Local AI folder intelligence. All data stays on your machine.
              No uploads. No cloud. Just you and your files.
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export function WorkspacePage() {
  const { folderPath, sidebarOpen, sourcePanelOpen, skipped, dispatch } = useApp()
  const [showSettings, setShowSettings] = useState(false)

  const folderName = folderPath || 'Workspace'

  return (
    <ChatProvider>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Nav */}
        <div
          style={{
            height: '48px',
            minHeight: '48px',
            background: '#0d0f14',
            borderBottom: '1px solid #1e2330',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={18} color="#6e8efb" />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                background: 'linear-gradient(90deg, #6e8efb, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Nanobot
            </span>
          </div>

          {/* Separator */}
          <div style={{ width: '1px', height: '20px', background: '#1e2330' }} />

          {/* Folder breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', flex: 1, minWidth: 0 }}>
            <FolderOpen size={13} color="#64748b" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {folderName}
            </span>
            {skipped.length > 0 && (
              <Tooltip content={`${skipped.length} protected file(s) skipped`}>
                <Badge variant="warning">{skipped.length} skipped</Badge>
              </Tooltip>
            )}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tooltip content="Settings">
              <button
                id="settings-btn"
                onClick={() => setShowSettings(true)}
                style={{
                  background: 'none',
                  border: '1px solid #1e2330',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6e8efb'; e.currentTarget.style.color = '#6e8efb' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2330'; e.currentTarget.style.color = '#64748b' }}
              >
                <Settings size={14} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Main 3-panel layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          <Sidebar />
          <ChatPanel />
          <SourcePanel />
        </div>
      </div>

      {/* Settings drawer */}
      {showSettings && <SettingsDrawer onClose={() => setShowSettings(false)} />}
    </ChatProvider>
  )
}
