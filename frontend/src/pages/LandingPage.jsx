import React, { useState } from 'react'
import { FolderOpen, Zap, AlertTriangle, ArrowRight, Bot, FolderSearch } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useScanner } from '../hooks/useScanner'
import { pickFolder } from '../lib/api'

export function LandingPage() {
  const [selectedHandle, setSelectedHandle] = useState(null)
  const [error, setError] = useState('')
  const [picking, setPicking] = useState(false)
  const { scan } = useScanner()

  async function handlePickFolder() {
    setError('')
    setPicking(true)
    try {
      const handle = await pickFolder()
      setSelectedHandle(handle)
    } catch (err) {
      // User cancelled the picker — not an error
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setPicking(false)
    }
  }

  async function handleScan() {
    if (!selectedHandle) {
      setError('Please select a folder first.')
      return
    }
    setError('')
    await scan(selectedHandle)
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0f14',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(110,142,251,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(110,142,251,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Glow blobs */}
      <div style={{
        position: 'absolute',
        top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(ellipse, rgba(110,142,251,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px', right: '10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content card */}
      <div
        className="animate-fade-in-up"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '540px',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            className="animate-pulse-glow"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(110,142,251,0.15), rgba(167,139,250,0.15))',
              border: '1px solid rgba(110,142,251,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={36} color="#6e8efb" />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0 }}>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #6e8efb, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Nanobot
              </span>
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
              AI-powered folder intelligence — search, summarize, explore.
            </p>
          </div>
        </div>

        {/* Picker card */}
        <div
          style={{
            width: '100%',
            background: '#141720',
            border: '1px solid #1e2330',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Choose a folder to index
          </div>

          {/* Folder picker button */}
          <button
            id="pick-folder-btn"
            onClick={handlePickFolder}
            disabled={picking}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              background: selectedHandle ? 'rgba(110,142,251,0.08)' : '#0d0f14',
              border: `1px dashed ${selectedHandle ? '#6e8efb' : '#252d40'}`,
              borderRadius: '8px',
              cursor: picking ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              width: '100%',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#6e8efb'
              e.currentTarget.style.background = 'rgba(110,142,251,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = selectedHandle ? '#6e8efb' : '#252d40'
              e.currentTarget.style.background = selectedHandle ? 'rgba(110,142,251,0.08)' : '#0d0f14'
            }}
          >
            {selectedHandle ? (
              <FolderOpen size={20} color="#6e8efb" />
            ) : (
              <FolderSearch size={20} color="#64748b" />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {selectedHandle ? (
                <>
                  <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedHandle.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6e8efb', marginTop: '2px' }}>
                    Click to change folder
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {picking ? 'Opening folder picker…' : 'Click to browse and select a folder'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', opacity: 0.6, marginTop: '2px' }}>
                    Uses your OS's native folder picker — no uploads
                  </div>
                </>
              )}
            </div>
            {selectedHandle && (
              <span style={{ fontSize: '10px', color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '4px', padding: '2px 6px', flexShrink: 0 }}>
                ✓ Selected
              </span>
            )}
          </button>

          {/* Error message */}
          {error && (
            <div style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={12} />
              {error}
            </div>
          )}

          {/* Start button */}
          <Button
            id="start-scan-btn"
            size="lg"
            disabled={!selectedHandle}
            onClick={handleScan}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Zap size={15} />
            Start Indexing
            <ArrowRight size={15} />
          </Button>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#94a3b8',
            lineHeight: 1.6,
          }}
        >
          <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>
            <strong style={{ color: '#f59e0b' }}>Note:</strong>{' '}
            Password-protected and binary files will be detected and skipped automatically.
            Your browser reads files locally — nothing is uploaded or sent anywhere.
          </span>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Local-only', 'Text search', 'Source citations', 'No uploads'].map(feat => (
            <span
              key={feat}
              style={{
                fontSize: '10px',
                padding: '3px 10px',
                background: '#141720',
                border: '1px solid #1e2330',
                borderRadius: '99px',
                color: '#64748b',
              }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
