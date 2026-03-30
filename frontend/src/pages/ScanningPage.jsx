import React, { useEffect, useRef } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Loader, X, FolderOpen, Bot } from 'lucide-react'
import { useApp } from '../context/AppContext'

function LogIcon({ type }) {
  switch (type) {
    case 'warning': return <AlertTriangle size={12} color="#f59e0b" />
    case 'success': return <CheckCircle size={12} color="#22c55e" />
    case 'error': return <XCircle size={12} color="#ef4444" />
    default: return <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1e2330', display: 'inline-block', flexShrink: 0 }} />
  }
}

function LogColor(type) {
  switch (type) {
    case 'warning': return '#f59e0b'
    case 'success': return '#22c55e'
    case 'error': return '#ef4444'
    default: return '#94a3b8'
  }
}

export function ScanningPage() {
  const { scanLogs, scanProgress, scanStatus, folderPath, navigate, dispatch } = useApp()
  const logsRef = useRef(null)

  // Auto-scroll logs
  useEffect(() => {
    logsRef.current?.scrollTo({ top: logsRef.current.scrollHeight, behavior: 'smooth' })
  }, [scanLogs])

  // Workspace transition is handled by useScanner hook —
  // no action needed here; we just show progress.

  function handleCancel() {
    dispatch({ type: 'SET_SCAN_STATUS', payload: 'cancelled' })
    navigate('landing')
  }

  const isComplete = scanStatus === 'complete'
  const isError = scanStatus === 'error'

  // folderPath is now just the folder name (handle.name)
  const folderName = folderPath || 'folder'

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

      <div
        className="animate-fade-in-up"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '620px',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isComplete ? (
            <CheckCircle size={32} color="#22c55e" />
          ) : isError ? (
            <XCircle size={32} color="#ef4444" />
          ) : (
            <Loader
              size={32}
              color="#6e8efb"
              style={{ animation: 'spin-slow 1.5s linear infinite' }}
            />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>
              {isComplete ? 'Indexing complete' : isError ? 'Error indexing folder' : 'Indexing your files…'}
            </h1>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <FolderOpen size={12} />
              {folderName}
            </div>
          </div>

          {!isComplete && (
            <button
              id="cancel-scan-btn"
              onClick={handleCancel}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: '1px solid #1e2330',
                borderRadius: '6px',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px 10px',
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2330'; e.currentTarget.style.color = '#64748b' }}
            >
              <X size={12} /> {isError ? 'Go Back' : 'Cancel'}
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: '#64748b' }}>
            <span>{isComplete ? 'Done' : isError ? 'Failed' : 'Scanning…'}</span>
            <span style={{ color: isComplete ? '#22c55e' : isError ? '#ef4444' : '#6e8efb', fontWeight: 600 }}>
              {scanProgress}%
            </span>
          </div>
          <div
            style={{
              height: '6px',
              background: '#1e2330',
              borderRadius: '99px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${scanProgress}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : isError
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : 'linear-gradient(90deg, #6e8efb, #a78bfa)',
                borderRadius: '99px',
                transition: 'width 0.4s ease, background 0.5s ease',
                boxShadow: isComplete
                  ? '0 0 10px rgba(34,197,94,0.4)'
                  : isError
                  ? '0 0 10px rgba(239, 68, 68, 0.4)'
                  : '0 0 10px rgba(110,142,251,0.4)',
              }}
            />
          </div>
        </div>

        {/* Log terminal */}
        <div
          style={{
            background: '#0a0c10',
            border: '1px solid #1e2330',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Terminal bar */}
          <div
            style={{
              padding: '8px 14px',
              background: '#141720',
              borderBottom: '1px solid #1e2330',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
              <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
            <span style={{ marginLeft: '8px', fontSize: '11px', color: '#64748b' }}>fol-tree — scan output</span>
          </div>

          {/* Log entries */}
          <div
            ref={logsRef}
            style={{
              height: '220px',
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {scanLogs.map((log, i) => (
              <div
                key={i}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  color: LogColor(log.type),
                }}
              >
                <span style={{ flexShrink: 0, marginTop: '1px' }}>
                  <LogIcon type={log.type} />
                </span>
                <span>{log.message}</span>
              </div>
            ))}
            {!isComplete && scanLogs.length === 0 && (
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="animate-scan-pulse">Initializing…</span>
              </div>
            )}
            {isComplete && (
              <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={12} />
                Fol-Tree is ready. Entering workspace…
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        {scanLogs.length > 0 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'Found', value: scanLogs.filter(l => l.type === 'info').length, color: '#6e8efb' },
              { label: 'Skipped', value: scanLogs.filter(l => l.type === 'warning').length, color: '#f59e0b' },
              { label: 'Indexed', value: isComplete ? scanLogs.filter(l => l.type === 'info').length : '…', color: '#22c55e' },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  background: '#141720',
                  border: '1px solid #1e2330',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
