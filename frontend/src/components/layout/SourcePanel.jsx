import React from 'react'
import { BookOpen, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { SourcePreview } from '../files/SourcePreview'
import { useApp } from '../../context/AppContext'
import { useChat } from '../../context/ChatContext'

export function SourcePanel() {
  const { sourcePanelOpen, dispatch } = useApp()
  const { activeSources } = useChat()

  function toggle() {
    dispatch({ type: 'TOGGLE_SOURCE_PANEL' })
  }

  if (!sourcePanelOpen) {
    return (
      <div
        style={{
          width: '36px',
          background: '#0d0f14',
          borderLeft: '1px solid #1e2330',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggle}
          title="Show sources"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '4px' }}
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={toggle}
          title="Show sources"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '4px' }}
        >
          <BookOpen size={15} />
        </button>
      </div>
    )
  }

  return (
    <div
      className="animate-slide-right"
      style={{
        width: '300px',
        minWidth: '300px',
        maxWidth: '300px',
        background: '#0d0f14',
        borderLeft: '1px solid #1e2330',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #1e2330',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <BookOpen size={14} color="#6e8efb" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500 }}>Sources</div>
          {activeSources.length > 0 && (
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              {activeSources.length} passage{activeSources.length !== 1 ? 's' : ''} cited
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '4px', borderRadius: '4px' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Source preview */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SourcePreview sources={activeSources} />
      </div>
    </div>
  )
}
