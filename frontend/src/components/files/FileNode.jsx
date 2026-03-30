import React, { useState } from 'react'
import {
  Folder, FolderOpen, File, FileText, Image, Archive,
  Code, FileJson, AlertTriangle, ChevronRight, ChevronDown,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Tooltip } from '../ui/Tooltip'
import { getFileColor, formatSize } from '../../lib/utils'
import { useApp } from '../../context/AppContext'

function FileIcon({ type, color, size = 15 }) {
  const props = { size, color, strokeWidth: 1.5 }
  switch (type) {
    case 'folder':   return <Folder {...props} />
    case 'pdf':      return <FileText {...props} />
    case 'txt':      return <FileText {...props} />
    case 'md':       return <FileText {...props} />
    case 'py': case 'js': case 'jsx': case 'ts': case 'tsx': case 'html': case 'css':
      return <Code {...props} />
    case 'json':     return <FileJson {...props} />
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg':
      return <Image {...props} />
    case 'zip':      return <Archive {...props} />
    default:         return <File {...props} />
  }
}

export function FileNode({ node, depth = 0, query = '' }) {
  const { selectedFile, dispatch } = useApp()
  const [open, setOpen] = useState(depth < 1)

  const isFolder = node.type === 'folder'
  const isSelected = selectedFile?.id === node.id
  const color = getFileColor(node.type)

  function handleClick() {
    if (isFolder) {
      setOpen(o => !o)
    } else {
      dispatch({ type: 'SET_SELECTED_FILE', payload: node })
    }
  }

  // Highlight match
  function renderName(name) {
    if (!query) return name
    const idx = name.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return name
    return (
      <>
        {name.slice(0, idx)}
        <mark style={{ background: 'rgba(110,142,251,0.25)', color: '#6e8efb', borderRadius: '2px' }}>
          {name.slice(idx, idx + query.length)}
        </mark>
        {name.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div>
      <div
        onClick={handleClick}
        role={isFolder ? 'button' : 'button'}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 8px',
          paddingLeft: `${8 + depth * 16}px`,
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background 0.15s',
          background: isSelected ? 'rgba(110,142,251,0.12)' : 'transparent',
          border: isSelected ? '1px solid rgba(110,142,251,0.2)' : '1px solid transparent',
          color: isSelected ? '#6e8efb' : '#e2e8f0',
          fontSize: '12px',
          userSelect: 'none',
        }}
        onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#141720')}
        onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
      >
        {/* Expand arrow for folders */}
        {isFolder ? (
          <span style={{ color: '#64748b', flexShrink: 0, width: '14px' }}>
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        ) : (
          <span style={{ width: '14px', flexShrink: 0 }} />
        )}

        {/* File/Folder Icon */}
        {isFolder ? (
          open
            ? <FolderOpen size={14} color={color} strokeWidth={1.5} />
            : <Folder size={14} color={color} strokeWidth={1.5} />
        ) : (
          <FileIcon type={node.type} color={color} size={14} />
        )}

        {/* Name */}
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {renderName(node.name)}
        </span>

        {/* Protected badge */}
        {node.protected && (
          <Tooltip content="Password protected — skipped">
            <AlertTriangle size={12} color="#f59e0b" />
          </Tooltip>
        )}

        {/* Size */}
        {!isFolder && node.size && (
          <span style={{ fontSize: '10px', color: '#64748b', flexShrink: 0 }}>
            {formatSize(node.size)}
          </span>
        )}
      </div>

      {/* Children */}
      {isFolder && open && node.children && (
        <div>
          {node.children.map(child => (
            <FileNode key={child.id} node={child} depth={depth + 1} query={query} />
          ))}
        </div>
      )}
    </div>
  )
}
