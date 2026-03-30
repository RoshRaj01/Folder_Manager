// ── File Type Utilities ────────────────────────────────

/** Get the extension of a filename (without dot, lowercase) */
export function getExtension(filename) {
  if (!filename) return ''
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/** Get a human-readable file size string */
export function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** Get icon color class based on file type */
export function getFileColor(type) {
  const colors = {
    folder: '#6e8efb',
    pdf:    '#ef4444',
    txt:    '#e2e8f0',
    md:     '#a78bfa',
    py:     '#22c55e',
    js:     '#f59e0b',
    jsx:    '#f59e0b',
    ts:     '#3b82f6',
    tsx:    '#3b82f6',
    json:   '#fb923c',
    html:   '#f97316',
    css:    '#818cf8',
    png:    '#ec4899',
    jpg:    '#ec4899',
    jpeg:   '#ec4899',
    gif:    '#ec4899',
    svg:    '#10b981',
    zip:    '#64748b',
    xlsx:   '#16a34a',
    csv:    '#16a34a',
    mp4:    '#8b5cf6',
    mp3:    '#8b5cf6',
  }
  return colors[type] || '#64748b'
}

// ── String Utilities ───────────────────────────────────

/** Truncate a string in the middle: "long/path/to/file.txt" → "long/...file.txt" */
export function truncatePath(path, maxLen = 40) {
  if (!path || path.length <= maxLen) return path
  const half = Math.floor((maxLen - 3) / 2)
  return `${path.slice(0, half)}...${path.slice(-half)}`
}

/** Highlight occurrences of a query in text */
export function highlight(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ── Date Utilities ─────────────────────────────────────

export function formatTimestamp(date) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date instanceof Date ? date : new Date(date))
}

// ── Misc ───────────────────────────────────────────────

/** Deep flatten a file tree into a flat array */
export function flattenTree(nodes) {
  const result = []
  function walk(nodes) {
    for (const node of nodes) {
      result.push(node)
      if (node.children) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

/** Generate a unique ID */
export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

/** Parse markdown-style bold/code into JSX-safe segments */
export function parseInlineMarkdown(text) {
  // Returns array of { type: 'text'|'bold'|'code', content }
  const segments = []
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g
  let last = 0, match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: 'text', content: text.slice(last, match.index) })
    const raw = match[0]
    if (raw.startsWith('`')) segments.push({ type: 'code', content: raw.slice(1, -1) })
    else                      segments.push({ type: 'bold', content: raw.slice(2, -2) })
    last = regex.lastIndex
  }
  if (last < text.length) segments.push({ type: 'text', content: text.slice(last) })
  return segments
}
