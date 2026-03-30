import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { FileNode } from './FileNode'
import { useApp } from '../../context/AppContext'
import { flattenTree } from '../../lib/utils'

export function FileTree() {
  const { files, skipped } = useApp()
  const [query, setQuery] = useState('')

  // Filter tree by query (flatten → match → return root nodes that have matches)
  const visibleFiles = query
    ? filterTree(files, query)
    : files

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search bar */}
      <div style={{ padding: '10px', borderBottom: '1px solid #1e2330', flexShrink: 0 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={13} color="#64748b" style={{ position: 'absolute', left: '9px', pointerEvents: 'none' }} />
          <input
            id="file-search"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter files…"
            style={{
              width: '100%',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: '#e2e8f0',
              background: '#0d0f14',
              border: '1px solid #1e2330',
              borderRadius: '5px',
              padding: '6px 28px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            className="input-glow"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: '8px',
                background: 'none', border: 'none',
                color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* File tree */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {visibleFiles.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
            {query ? `No files match "${query}"` : 'No files indexed.'}
          </div>
        ) : (
          visibleFiles.map(node => (
            <FileNode key={node.id} node={node} depth={0} query={query} />
          ))
        )}
      </div>

      {/* Skipped files footer */}
      {skipped.length > 0 && (
        <div
          style={{
            padding: '8px 10px',
            borderTop: '1px solid #1e2330',
            fontSize: '11px',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600 }}>{skipped.length}</span>
          <span style={{ color: '#64748b' }}>protected file{skipped.length !== 1 ? 's' : ''} skipped</span>
        </div>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────
function nodeMatches(node, query) {
  return node.name.toLowerCase().includes(query.toLowerCase())
}

function filterTree(nodes, query) {
  const result = []
  for (const node of nodes) {
    if (node.type === 'folder' && node.children) {
      const filteredChildren = filterTree(node.children, query)
      if (filteredChildren.length > 0 || nodeMatches(node, query)) {
        result.push({ ...node, children: filteredChildren })
      }
    } else if (nodeMatches(node, query)) {
      result.push(node)
    }
  }
  return result
}
