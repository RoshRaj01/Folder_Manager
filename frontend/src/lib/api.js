/**
 * api.js — Real filesystem integration via File System Access API.
 * No mock data. No backend. Everything runs in your browser, locally.
 *
 * Scan:  Uses showDirectoryPicker() + recursive FileSystemDirectoryHandle traversal
 * Chat:  Reads actual file text and does keyword search to produce grounded answers
 * Status: Always 'ready' (no server needed)
 */

// ── Globals ────────────────────────────────────────────
// File extensions we can read as text and index
const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'json', 'js', 'jsx', 'ts', 'tsx',
  'html', 'htm', 'css', 'scss', 'sass', 'less',
  'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp',
  'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
  'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env',
  'xml', 'svg', 'csv', 'tsv', 'log', 'sql',
  'vue', 'svelte', 'astro',
  'cs', 'php', 'swift', 'kt', 'r', 'lua', 'pl',
  'gitignore', 'dockerignore', 'editorconfig', 'prettierrc',
  'eslintrc', 'babelrc',
])

// Extensions to skip (binary / unreadable as text)
const BINARY_EXTENSIONS = new Set([
  'pdf', 'docx', 'doc', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'rar', '7z', 'tar', 'gz',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tiff',
  'mp3', 'wav', 'flac', 'ogg', 'm4a',
  'mp4', 'avi', 'mov', 'mkv', 'webm',
  'exe', 'dll', 'so', 'dylib',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'pyc', 'pyo', 'class', 'o',
  'db', 'sqlite', 'sqlite3',
])

// Folders to skip entirely
const SKIP_FOLDERS = new Set([
  'node_modules', '.git', '.svn', '.hg',
  '__pycache__', '.pytest_cache',
  '.next', '.nuxt', 'dist', 'build', 'out',
  '.vscode', '.idea', '.DS_Store',
  'venv', '.venv', 'env', '.env',
  'coverage', '.nyc_output',
])

// ── In-memory index ────────────────────────────────────
// Populated during scan, used for chat search
let gFileIndex = [] // Array<{ path, name, type, size, content?, handle }>
let gDirectoryHandle = null

// ── ID counter ─────────────────────────────────────────
let idCounter = 0
function nextId() { return String(++idCounter) }

// ── Helpers ────────────────────────────────────────────
function getExtension(name) {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

function isText(name) {
  const ext = getExtension(name)
  if (TEXT_EXTENSIONS.has(ext)) return true
  // Files with no extension like Makefile, Dockerfile, etc.
  if (!ext && !name.startsWith('.')) return true
  return false
}

function isBinary(name) {
  return BINARY_EXTENSIONS.has(getExtension(name))
}

/**
 * Detect if a file is likely password-protected / unreadable.
 * We attempt to read the first 4 bytes and check for known magic bytes.
 */
async function isPasswordProtected(fileHandle) {
  try {
    const file = await fileHandle.getFile()
    if (file.size === 0) return false
    const buf = await file.slice(0, 4).arrayBuffer()
    const bytes = new Uint8Array(buf)
    // PDF: %PDF
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      // Can't easily detect password without parsing — just note it's a PDF
      return false
    }
    // ZIP-based Office docs: PK magic
    // We mark encrypted zips as protected if we get a read error later
    return false
  } catch {
    return true
  }
}

/**
 * Safely read text content from a file handle.
 * Returns null if unreadable (binary, too large, encrypted).
 */
async function readText(fileHandle) {
  try {
    const file = await fileHandle.getFile()
    // Skip large files (>2MB) to keep indexing fast
    if (file.size > 2 * 1024 * 1024) return null
    const text = await file.text()
    // Heuristic: if more than 5% of chars are non-printable → binary
    const sample = text.slice(0, 512)
    let nonPrintable = 0
    for (const ch of sample) {
      const code = ch.charCodeAt(0)
      if (code < 9 || (code > 13 && code < 32)) nonPrintable++
    }
    if (nonPrintable / sample.length > 0.05) return null
    return text
  } catch {
    return null
  }
}

// ── Core scan ──────────────────────────────────────────

/**
 * Recursively walk a FileSystemDirectoryHandle.
 * Yields progress events and builds gFileIndex.
 */
async function* walkDirectory(dirHandle, parentPath, depth = 0) {
  let entries = []
  try {
    for await (const [, entry] of dirHandle) {
      entries.push(entry)
    }
  } catch (err) {
    yield { message: `⚠ Cannot read: ${parentPath} (${err.message})`, type: 'warning' }
    return
  }

  // Sort: folders first, then files, alphabetical
  entries.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  for (const entry of entries) {
    const entryPath = parentPath ? `${parentPath}/${entry.name}` : entry.name

    if (entry.kind === 'directory') {
      if (SKIP_FOLDERS.has(entry.name) || entry.name.startsWith('.')) {
        yield { message: `Skipped folder: ${entryPath} (system/build folder)`, type: 'muted' }
        continue
      }
      yield { message: `Scanning: ${entryPath}/`, type: 'info' }
      yield* walkDirectory(entry, entryPath, depth + 1)
    } else {
      // It's a file
      let file
      try { file = await entry.getFile() } catch {
        yield { message: `Skipped: ${entryPath} (cannot open)`, type: 'warning' }
        continue
      }

      const ext = getExtension(entry.name)
      const record = {
        id: nextId(),
        name: entry.name,
        type: ext || 'file',
        path: '/' + entryPath,
        size: file.size,
        handle: entry,
        protected: false,
        content: null,
      }

      if (isText(entry.name)) {
        const text = await readText(entry)
        if (text !== null) {
          record.content = text
          gFileIndex.push(record)
          yield { message: `Indexed: ${entryPath}`, type: 'info' }
        } else {
          record.protected = false
          gFileIndex.push(record)
          yield { message: `Skipped content: ${entryPath} (binary/too large)`, type: 'muted' }
        }
      } else if (isBinary(entry.name)) {
        // Binary files: add to tree but don't index content
        // Try to detect password protection
        const protected_ = await isPasswordProtected(entry)
        record.protected = protected_
        gFileIndex.push(record)
        if (protected_) {
          yield { message: `Skipped (password protected): ${entryPath}`, type: 'warning' }
        } else {
          yield { message: `Found: ${entryPath}`, type: 'info' }
        }
      } else {
        gFileIndex.push(record)
        yield { message: `Found: ${entryPath}`, type: 'info' }
      }
    }
  }
}

/**
 * Build a nested file tree from the flat gFileIndex.
 */
function buildTree(directoryName) {
  const root = []
  const dirs = new Map() // path → node

  // Sort by path so parents come before children
  const sorted = [...gFileIndex].sort((a, b) => a.path.localeCompare(b.path))

  for (const record of sorted) {
    // Strip leading slash, split
    const parts = record.path.slice(1).split('/')
    const fileName = parts.pop()

    if (parts.length === 0) {
      // Root-level file
      root.push({
        id: record.id,
        name: record.name,
        type: record.type,
        path: record.path,
        size: record.size,
        protected: record.protected,
      })
      continue
    }

    // Ensure all parent folders exist
    let currentChildren = root
    let currentPath = ''
    for (const part of parts) {
      currentPath += '/' + part
      if (!dirs.has(currentPath)) {
        const folderNode = {
          id: nextId(),
          name: part,
          type: 'folder',
          path: currentPath,
          children: [],
        }
        currentChildren.push(folderNode)
        dirs.set(currentPath, folderNode)
      }
      currentChildren = dirs.get(currentPath).children
    }

    currentChildren.push({
      id: record.id,
      name: record.name,
      type: record.type,
      path: record.path,
      size: record.size,
      protected: record.protected,
    })
  }

  // Wrap in a root folder node named after the directory
  return [{
    id: nextId(),
    name: directoryName,
    type: 'folder',
    path: '/',
    children: root,
  }]
}

// ── Public API ─────────────────────────────────────────

/**
 * Open the OS native folder picker and return the handle.
 * Throws if user cancels.
 */
export async function pickFolder() {
  if (!('showDirectoryPicker' in window)) {
    throw new Error(
      'Your browser does not support the File System Access API. Please use Chrome, Edge, or Opera.'
    )
  }
  return await window.showDirectoryPicker({ mode: 'read' })
}

/**
 * Async generator that yields scan progress events.
 * Call pickFolder() first to get a dirHandle.
 *
 * Each event: { message, type: 'info'|'warning'|'muted', progress? }
 */
export async function* scanFolderStream(dirHandle) {
  // Reset index
  gFileIndex = []
  idCounter = 0
  gDirectoryHandle = dirHandle

  yield { message: `Opening folder: ${dirHandle.name}`, type: 'info', progress: 0 }

  // Collect all events first so we can compute progress
  const events = []
  for await (const event of walkDirectory(dirHandle, '')) {
    events.push(event)
  }

  // Re-yield with progress
  for (let i = 0; i < events.length; i++) {
    const progress = Math.round(((i + 1) / events.length) * 100)
    yield { ...events[i], progress }
  }

  yield {
    message: `Indexing complete — ${gFileIndex.filter(f => f.content !== null).length} files indexed, ${gFileIndex.filter(f => f.protected).length} skipped.`,
    type: 'success',
    progress: 100,
  }
}

/**
 * Build and return the complete file tree after a scan.
 * Call this after scanFolderStream() finishes.
 */
export function getScannedData(dirHandle) {
  const files = buildTree(dirHandle?.name || 'Folder')
  const skipped = gFileIndex
    .filter(f => f.protected)
    .map(f => ({ path: f.path, reason: 'Password protected or unreadable' }))
  return { files, skipped }
}

/**
 * Search the indexed files for a query.
 * Returns { answer, sources }.
 */
export async function sendMessage(query) {
  const q = query.toLowerCase()

  if (!gFileIndex.length) {
    return {
      answer: "⚠️ No files have been indexed yet. Please scan a folder first.",
      sources: [],
    }
  }

  // Search every indexed file's content for the query terms
  const terms = q.split(/\s+/).filter(t => t.length > 2)
  const matches = []

  for (const record of gFileIndex) {
    if (!record.content) continue

    const lines = record.content.split('\n')
    let score = 0
    const hits = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      let lineScore = 0
      for (const term of terms) {
        if (line.includes(term)) lineScore++
      }
      if (lineScore > 0) {
        score += lineScore
        hits.push({ lineNum: i + 1, text: lines[i].trim(), score: lineScore })
      }
    }

    if (score > 0) {
      hits.sort((a, b) => b.score - a.score)
      matches.push({ record, score, hits: hits.slice(0, 3) })
    }
  }

  if (!matches.length) {
    return {
      answer: `I searched through **${gFileIndex.filter(f => f.content).length} indexed files** but couldn't find any content matching "${query}".\n\nTry rephrasing your query, or check the file list in the sidebar to see what was indexed.`,
      sources: [],
    }
  }

  // Sort by relevance score
  matches.sort((a, b) => b.score - a.score)
  const topMatches = matches.slice(0, 5)

  // Build the answer
  const fileList = topMatches
    .map(m => `- \`${m.record.path}\` (${m.score} match${m.score !== 1 ? 'es' : ''})`)
    .join('\n')

  let answer = `Found **${matches.length} file${matches.length !== 1 ? 's' : ''}** matching your query across ${gFileIndex.filter(f => f.content).length} indexed files.\n\n`
  answer += `**Most relevant files:**\n${fileList}\n\n`

  // Show top snippet
  const top = topMatches[0]
  if (top.hits.length > 0) {
    const snippet = top.hits.map(h => h.text).join('\n').slice(0, 400)
    answer += `**From \`${top.record.path}\`:**\n\`\`\`\n${snippet}\n\`\`\``
  }

  const sources = topMatches.flatMap(m =>
    m.hits.slice(0, 2).map(h => ({
      file: m.record.path,
      line: h.lineNum,
      snippet: h.text,
    }))
  )

  return { answer, sources }
}

/**
 * Get current status (always 'ready' when running locally).
 */
export async function getStatus() {
  return { status: gFileIndex.length > 0 ? 'ready' : 'idle' }
}

/**
 * Legacy: not used in real integration.
 */
export async function scanFolder() {
  throw new Error('Use scanFolderStream() + getScannedData() instead.')
}
