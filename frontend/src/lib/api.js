/**
 * api.js — Backend integration via FastAPI.
 *
 * All scanning and querying is handled by the Python backend.
 * Vite proxies /api → http://localhost:8000 (configured in vite.config.js).
 *
 * Flow:
 *   1. User types a folder path on LandingPage
 *   2. scanFolderStream(folderPath) → POST /api/set-folder → streams progress events
 *   3. getScannedData()            → GET  /api/debug-index/:sessionId → file tree
 *   4. sendMessage(query)          → POST /api/query → { reply, error }
 */

// ── Session ID ──────────────────────────────────────────
// Persists across hot-reloads; cleared on tab close (sessionStorage).
const SESSION_ID = (() => {
  let id = sessionStorage.getItem('Fol-Tree_session_id')
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
    sessionStorage.setItem('Fol-Tree_session_id', id)
  }
  return id
})()

export { SESSION_ID }

// ── Helpers ────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  return res
}

// ── Public API ─────────────────────────────────────────

/**
 * Async generator that drives the ScanningPage progress UI.
 * Calls POST /api/set-folder and yields log events before + after.
 *
 * @param {string} folderPath  Absolute OS path typed by the user
 */
export async function* scanFolderStream(folderPath) {
  yield { message: `Starting indexer for: ${folderPath}`, type: 'info', progress: 5 }
  yield { message: `Connecting to Fol-Tree backend…`, type: 'info', progress: 12 }

  try {
    const res = await apiFetch('/set-folder', {
      method: 'POST',
      body: JSON.stringify({ session_id: SESSION_ID, folder_path: folderPath }),
    })

    yield { message: `Backend responded — processing result…`, type: 'info', progress: 75 }

    if (!res.ok) {
      let detail = res.statusText
      try {
        const err = await res.json()
        detail = err.detail || detail
      } catch { /* ignore parse error */ }
      yield {
        message: `Error from server: ${detail}`,
        type: 'error',
        progress: 100,
      }
      return
    }

    const data = await res.json()
    // data: { success: true, total_files: N, folder: '...' }

    yield {
      message: `Building file tree… (${data.total_files} files found)`,
      type: 'info',
      progress: 90,
    }
    yield {
      message: `Indexing complete — ${data.total_files} file(s) indexed.`,
      type: 'success',
      progress: 100,
    }
  } catch (err) {
    yield {
      message: `Cannot reach backend: ${err.message}. Is the server running on port 8000?`,
      type: 'error',
      progress: 100,
    }
  }
}

/**
 * Fetch indexed file data from the backend and build a flat file tree.
 * Call this after scanFolderStream() finishes (i.e. in useScanner after startScan).
 *
 * @returns {{ files: FileNode[], skipped: SkippedFile[] }}
 */
export async function getScannedData() {
  try {
    const res = await apiFetch(`/debug-index/${SESSION_ID}`)
    if (!res.ok) return { files: [], skipped: [] }

    const data = await res.json()
    if (data.error || !data.files) return { files: [], skipped: [] }

    // Build a single root folder node with flat file children
    const folderName = data.folder
      ? data.folder.split(/[\\/]/).filter(Boolean).pop() || 'Folder'
      : 'Folder'

    const children = data.files.map((f, i) => {
      const ext = f.name.includes('.') ? f.name.split('.').pop().toLowerCase() : 'file'
      return {
        id: String(i + 1),
        name: f.name,
        type: ext,
        path: `/${f.name}`,
        size: Math.round((f.size_kb || 0) * 1024),
        protected: false,
        createdAt: f.created_at || 0,
        modifiedAt: f.modified_at || 0,
      }
    })

    const files = [
      {
        id: 'root',
        name: folderName,
        type: 'folder',
        path: '/',
        children,
      },
    ]

    return { files, skipped: [] }
  } catch {
    return { files: [], skipped: [] }
  }
}

/**
 * Send a chat message to the backend agent and get a reply.
 *
 * @param {string} query  User's natural-language question
 * @returns {{ answer: string, sources: [] }}
 */
export async function sendMessage(query) {
  const res = await apiFetch('/query', {
    method: 'POST',
    body: JSON.stringify({ session_id: SESSION_ID, message: query }),
  })

  if (!res.ok) {
    throw new Error(`Server error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  // data: { reply: '...', error: null | '...' }

  if (data.error) {
    throw new Error(data.error)
  }

  return {
    answer: data.reply || '(No response from agent)',
    action: data.action,
    target: data.target,
    sources: [], // backend does not return structured sources yet
  }
}

/**
 * Creates a file or folder via backend.
 */
export async function createItem(filename, isFolder = false) {
  const res = await apiFetch('/create-item', {
    method: 'POST',
    body: JSON.stringify({ session_id: SESSION_ID, filename, is_folder: isFolder }),
  })
  if (!res.ok) {
    let detail = 'Error creating item'
    try { const err = await res.json(); detail = err.detail || detail } catch {}
    throw new Error(detail)
  }
  return res.json()
}

/**
 * Deletes a file or folder via backend.
 */
export async function deleteItem(filename) {
  const res = await apiFetch('/delete-item', {
    method: 'POST',
    body: JSON.stringify({ session_id: SESSION_ID, filename }),
  })
  if (!res.ok) {
    let detail = 'Error deleting item'
    try { const err = await res.json(); detail = err.detail || detail } catch {}
    throw new Error(detail)
  }
  return res.json()
}

/**
 * Check if the backend is reachable and healthy.
 * @returns {{ status: 'ready' | 'offline' }}
 */
export async function getStatus() {
  try {
    const res = await apiFetch('/health')
    return res.ok ? { status: 'ready' } : { status: 'offline' }
  } catch {
    return { status: 'offline' }
  }
}

// ── Legacy ─────────────────────────────────────────────
// These were used by the browser-only implementation.
// Kept as stubs so any stale imports don't crash at parse time.

export async function pickFolder() {
  // No longer used for indexing — path is typed by user.
  // Keeping for any stale references.
  throw new Error('pickFolder() is no longer used. Enter the folder path in the text field.')
}

export async function scanFolder() {
  throw new Error('Use scanFolderStream() + getScannedData() instead.')
}
