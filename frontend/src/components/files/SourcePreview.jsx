import React from 'react'
import { FileText, ChevronRight, Hash, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { getFileColor, getExtension } from '../../lib/utils'

export function SourcePreview({ sources }) {
  if (!sources?.length) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <FileText size={32} color="#1e2330" />
        <div>
          <div style={{ color: '#e2e8f0', marginBottom: '4px', fontSize: '13px' }}>No sources yet</div>
          <div>Ask Nanobot a question to see referenced file passages here.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
      {sources.map((source, i) => (
        <SourceCard key={i} source={source} index={i} />
      ))}
    </div>
  )
}

function SourceCard({ source, index }) {
  const [copied, setCopied] = useState(false)
  const ext = getExtension(source.file)
  const color = getFileColor(ext)

  // Extract filename from path
  const parts = source.file.replace(/\\/g, '/').split('/')
  const filename = parts[parts.length - 1]
  const dir = parts.slice(0, -1).join('/')

  function handleCopy() {
    navigator.clipboard.writeText(source.snippet || source.file).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.05}s`,
        background: '#141720',
        border: '1px solid #1e2330',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #1e2330',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#0d0f14',
        }}
      >
        {/* Colored indicator */}
        <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: color, flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {filename}
          </div>
          {dir && (
            <div style={{ fontSize: '10px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dir}
            </div>
          )}
        </div>

        {source.line && (
          <Badge variant="accent">
            <Hash size={9} />
            L{source.line}
          </Badge>
        )}

        <button
          onClick={handleCopy}
          title="Copy snippet"
          style={{
            background: 'none', border: 'none',
            color: copied ? '#22c55e' : '#64748b',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            transition: 'color 0.2s',
            padding: '2px',
          }}
          onMouseEnter={e => !copied && (e.currentTarget.style.color = '#e2e8f0')}
          onMouseLeave={e => !copied && (e.currentTarget.style.color = '#64748b')}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>

      {/* Snippet */}
      {source.snippet && (
        <div style={{ padding: '10px 12px' }}>
          <pre
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {source.snippet}
          </pre>
        </div>
      )}
    </div>
  )
}
