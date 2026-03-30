import React from 'react'
import { Bot, User, FileText, ChevronRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { useChat } from '../../context/ChatContext'

function renderContent(content) {
  // Split on code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lines = part.slice(3, -3).trim().split('\n')
      const lang = lines[0].match(/^[a-z]+$/) ? lines.shift() : ''
      return (
        <pre
          key={i}
          style={{
            background: '#0d0f14',
            border: '1px solid #1e2330',
            borderRadius: '6px',
            padding: '12px',
            overflowX: 'auto',
            fontSize: '12px',
            lineHeight: 1.6,
            margin: '8px 0',
          }}
        >
          {lang && (
            <span style={{ color: '#6e8efb', fontSize: '10px', display: 'block', marginBottom: '6px' }}>
              {lang}
            </span>
          )}
          <code style={{ color: '#e2e8f0' }}>{lines.join('\n')}</code>
        </pre>
      )
    }

    // Render inline with bold/code
    return (
      <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
        {part.split('\n').map((line, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {renderInline(line)}
          </React.Fragment>
        ))}
      </span>
    )
  })
}

function renderInline(text) {
  const segments = []
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g
  let last = 0, match, key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) segments.push(<span key={key++}>{text.slice(last, match.index)}</span>)
    const raw = match[0]
    if (raw.startsWith('`')) {
      segments.push(
        <code key={key++} style={{
          background: '#1e2330', color: '#a78bfa',
          borderRadius: '3px', padding: '1px 5px', fontSize: '12px',
        }}>
          {raw.slice(1, -1)}
        </code>
      )
    } else {
      segments.push(<strong key={key++} style={{ color: '#e2e8f0' }}>{raw.slice(2, -2)}</strong>)
    }
    last = regex.lastIndex
  }
  if (last < text.length) segments.push(<span key={key++}>{text.slice(last)}</span>)
  return segments
}

export function MessageBubble({ message }) {
  const { setActiveSources } = useChat()
  const isUser = message.role === 'user'
  const isError = message.isError

  function handleSourceClick() {
    if (message.sources?.length) {
      setActiveSources(message.sources)
    }
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        maxWidth: '100%',
        padding: '4px 0',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: isUser
            ? 'rgba(110,142,251,0.15)'
            : 'linear-gradient(135deg, rgba(110,142,251,0.2), rgba(167,139,250,0.2))',
          border: `1px solid ${isUser ? '#1e2330' : 'rgba(110,142,251,0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isUser
          ? <User size={15} color="#6e8efb" />
          : <Bot size={15} color="#a78bfa" />
        }
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: isUser ? '#6e8efb' : '#a78bfa', fontWeight: 600 }}>
            {isUser ? 'You' : 'Nanobot'}
          </span>
          <span style={{ fontSize: '10px', color: '#64748b' }}>{message.timestamp}</span>
          {isError && <Badge variant="error">Error</Badge>}
        </div>

        {/* Message Body */}
        <div
          style={{
            color: isError ? '#ef4444' : '#e2e8f0',
            fontSize: '13px',
            lineHeight: 1.7,
            padding: isUser ? '10px 14px' : 0,
            background: isUser ? '#141720' : 'transparent',
            border: isUser ? '1px solid #1e2330' : 'none',
            borderRadius: isUser ? '6px' : 0,
          }}
        >
          {renderContent(message.content)}
        </div>

        {/* Sources */}
        {!isUser && message.sources?.length > 0 && (
          <button
            onClick={handleSourceClick}
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              background: 'rgba(110,142,251,0.08)',
              border: '1px solid rgba(110,142,251,0.2)',
              borderRadius: '5px',
              color: '#6e8efb',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'JetBrains Mono', monospace",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(110,142,251,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(110,142,251,0.08)' }}
          >
            <FileText size={12} />
            {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
