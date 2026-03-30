import React, { useState } from 'react'
import { Search, X, Plus, FilePlus, FolderPlus, ArrowDownUp } from 'lucide-react'
import { FileNode } from './FileNode'
import { useApp } from '../../context/AppContext'
import { createItem } from '../../lib/api'

export function FileTree() {
  const { files, skipped, refreshWorkspace } = useApp()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortAsc, setSortAsc] = useState(true)
  
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createType, setCreateType] = useState('file') // 'file' or 'folder'
  const [isCreating, setIsCreating] = useState(false)

  // Filter tree by query (flatten → match → return root nodes that have matches)
  const visibleFiles = query
    ? filterTree(files, query)
    : files

  const orderedFiles = sortNodes(visibleFiles, sortBy, sortAsc)

  async function handleCreate(e) {
    if (e.key === 'Enter') {
      if (!createName.trim()) {
        setShowCreate(false)
        return
      }
      setIsCreating(true)
      try {
        await createItem(createName.trim(), createType === 'folder')
        setCreateName('')
        setShowCreate(false)
        await refreshWorkspace()
      } catch (err) {
        alert(err.message)
      } finally {
        setIsCreating(false)
      }
    } else if (e.key === 'Escape') {
      setShowCreate(false)
      setCreateName('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search and Tool bar */}
      <div style={{ padding: '10px', borderBottom: '1px solid #1e2330', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {/* Internal search box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
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
          <button
            onClick={() => setShowCreate(!showCreate)}
            style={{
              background: showCreate ? '#1e2330' : 'transparent',
              border: '1px solid #1e2330',
              borderRadius: '5px',
              padding: '6px',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
            title="Create new file or folder"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Sort and tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 style={{
                     background: '#0d0f14',
                     color: '#94a3b8',
                     border: '1px solid #1e2330',
                     borderRadius: '4px',
                     fontSize: '11px',
                     padding: '2px 4px',
                     fontFamily: "'JetBrains Mono', monospace",
                     outline: 'none',
                 }}
             >
                 <option value="name">Name</option>
                 <option value="date_modified">Date Modified</option>
                 <option value="date_created">Date Created</option>
                 <option value="size">Size</option>
                 <option value="type">Extension</option>
             </select>
             <button
                 onClick={() => setSortAsc(!sortAsc)}
                 style={{
                     background: 'none', border: 'none',
                     color: '#64748b', cursor: 'pointer',
                     display: 'flex', alignItems: 'center',
                 }}
                 title={sortAsc ? "Ascending" : "Descending"}
             >
                 <ArrowDownUp size={12} />
             </button>
        </div>

        {/* Create Input UI inline */}
        {showCreate && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                 <button
                     onClick={() => setCreateType(createType === 'file' ? 'folder' : 'file')}
                     style={{
                         background: 'transparent',
                         border: 'none',
                         color: '#6e8efb',
                         cursor: 'pointer',
                         padding: '2px',
                         display: 'flex', alignItems: 'center',
                     }}
                     title={`Currently creating ${createType}. Click to toggle.`}
                 >
                     {createType === 'file' ? <FilePlus size={14} /> : <FolderPlus size={14} />}
                 </button>
                 <input
                     autoFocus
                     type="text"
                     value={createName}
                     onChange={e => setCreateName(e.target.value)}
                     onKeyDown={handleCreate}
                     disabled={isCreating}
                     placeholder={createType === 'file' ? 'NewFile.js' : 'NewFolder'}
                     style={{
                         flex: 1,
                         fontFamily: "'JetBrains Mono', monospace",
                         fontSize: '11px',
                         background: '#141720',
                         border: '1px solid #6e8efb',
                         borderRadius: '4px',
                         color: '#e2e8f0',
                         padding: '4px 8px',
                         outline: 'none'
                     }}
                 />
                 {isCreating && <span style={{fontSize:'10px', color:'#94a3b8'}}>...</span>}
             </div>
        )}
      </div>

      {/* File tree */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {visibleFiles.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
            {query ? `No files match "${query}"` : 'No files found.'}
          </div>
        ) : (
          orderedFiles.map(node => (
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

function sortNodes(nodes, sortBy, sortAsc) {
  const sorted = [...nodes].sort((a, b) => {
    // Folders always first (optional, but good practice). Or we can sort everything together.
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;

    let diff = 0;
    if (sortBy === 'name') diff = a.name.localeCompare(b.name);
    else if (sortBy === 'size') diff = (a.size || 0) - (b.size || 0);
    else if (sortBy === 'type') diff = a.type.localeCompare(b.type);
    else if (sortBy === 'date_created') diff = (a.createdAt || 0) - (b.createdAt || 0);
    else if (sortBy === 'date_modified') diff = (a.modifiedAt || 0) - (b.modifiedAt || 0);

    return sortAsc ? diff : -diff;
  });

  return sorted.map(node => {
     if (node.children) {
         return { ...node, children: sortNodes(node.children, sortBy, sortAsc) };
     }
     return node;
  });
}
