import React from 'react'
import { FolderOpen, Settings, RefreshCw, ChevronLeft, ChevronRight, Bot } from 'lucide-react'
import { FileTree } from '../files/FileTree'
import { Tooltip } from '../ui/Tooltip'
import { useApp } from '../../context/AppContext'

export function Sidebar() {
  const { sidebarOpen, dispatch, folderPath, files, skipped } = useApp()

  // Get just the folder name from the full path
  const folderName = folderPath
    ? folderPath.replace(/\\/g, '/').split('/').filter(Boolean).pop() || folderPath
    : 'No folder'

  const totalFiles = countFiles(files)

  function toggle() {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  if (!sidebarOpen) {
    return (
      <div
        style={{
          width: '40px',
          background: '#0d0f14',
          borderRight: '1px solid #1e2330',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <Tooltip content="Expand sidebar" placement="right">
          <button onClick={toggle} style={iconBtnStyle}>
            <ChevronRight size={15} color="#64748b" />
          </button>
        </Tooltip>
        <Tooltip content="Files" placement="right">
          <button style={iconBtnStyle}>
            <FolderOpen size={15} color="#64748b" />
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div
      className="animate-slide-left"
      style={{
        width: '260px',
        minWidth: '260px',
        maxWidth: '260px',
        background: '#0d0f14',
        borderRight: '1px solid #1e2330',
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
        <FolderOpen size={15} color="#6e8efb" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {folderName}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>
            {totalFiles} files · {skipped.length} skipped
          </div>
        </div>
        <Tooltip content="Collapse sidebar">
          <button onClick={toggle} style={iconBtnStyle}>
            <ChevronLeft size={14} color="#64748b" />
          </button>
        </Tooltip>
      </div>

      {/* Section label */}
      <div style={{ padding: '8px 12px 4px', flexShrink: 0 }}>
        <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Files
        </span>
      </div>

      {/* File tree — flex: 1 to fill remaining space */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <FileTree />
      </div>
    </div>
  )
}

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  borderRadius: '4px',
  transition: 'background 0.15s',
}

function countFiles(nodes) {
  let count = 0
  function walk(nodes) {
    for (const n of nodes) {
      if (n.type !== 'folder') count++
      if (n.children) walk(n.children)
    }
  }
  walk(nodes)
  return count
}
