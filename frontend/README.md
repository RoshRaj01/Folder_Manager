# Nanobot — Frontend

> AI-powered local folder intelligence. Index any folder on your machine, then search and explore its contents through a chat interface — entirely in your browser, zero uploads.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Icons | Lucide React |
| Font | JetBrains Mono (Google Fonts) |
| State | React Context + `useReducer` |
| Filesystem | [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build
```

> **Requires Chrome, Edge, or Opera** — the File System Access API (`showDirectoryPicker`) is not supported in Firefox or Safari.

---

## How It Works

1. **Pick a folder** — clicking the folder button opens your OS's native folder picker dialog via `showDirectoryPicker()`. No path is ever typed manually.
2. **Scan** — the browser recursively walks the directory tree, reads text files (up to 2 MB each), and builds an in-memory index. Binary files (images, videos, executables) and system folders (`node_modules`, `.git`, `dist`, etc.) are skipped automatically.
3. **Chat** — queries are run as keyword searches over the indexed content. Results include the matched file paths, line numbers, and relevant snippets, shown in the right-hand Sources panel.
4. **Nothing leaves your machine** — no network requests are made to any external service.

---

## Project Structure

```
frontend/
├── index.html                  # Entry HTML (JetBrains Mono font, SEO meta)
├── vite.config.js              # Vite + Tailwind v4 plugin + /api proxy
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Page router (context-driven, no react-router)
│   ├── index.css               # Design tokens, animations, global resets
│   │
│   ├── lib/
│   │   ├── api.js              # All filesystem + chat logic (File System Access API)
│   │   └── utils.js            # File icons, formatters, tree helpers
│   │
│   ├── context/
│   │   ├── AppContext.jsx      # Global state: page, folder handle, files, scan progress
│   │   └── ChatContext.jsx     # Chat thread, thinking state, active source citations
│   │
│   ├── hooks/
│   │   ├── useScanner.js       # Orchestrates scan stream → workspace transition
│   │   └── useChat.js          # Wrapper: submits messages to ChatContext
│   │
│   ├── components/
│   │   ├── ui/                 # Button, Input, Badge, Spinner, Tooltip
│   │   ├── chat/               # MessageBubble, ChatInput, TypingIndicator
│   │   ├── files/              # FileTree, FileNode, SourcePreview
│   │   └── layout/             # Sidebar, ChatPanel, SourcePanel
│   │
│   └── pages/
│       ├── LandingPage.jsx     # Folder picker UI
│       ├── ScanningPage.jsx    # Progress bar + terminal log output
│       └── WorkspacePage.jsx   # 3-panel workspace + settings drawer
```

---

## Pages

### LandingPage
Native OS folder picker (dashed-border button → `showDirectoryPicker()`). Shows selected folder name with a green **✓ Selected** badge. Start Indexing is disabled until a folder is chosen.

### ScanningPage
- Animated spinner + gradient progress bar (turns green on completion)
- Terminal-style log output with colour-coded status icons
- Live stat cards: **Found / Skipped / Indexed**
- Cancel button

### WorkspacePage — 3-panel layout

| Panel | Description |
|---|---|
| **Left — Sidebar** | Collapsible file tree. Real-time filter search. Type-coloured icons. ⚠ badge on password-protected files. File sizes. |
| **Centre — Chat** | Message thread with Nanobot avatar. Markdown rendering (bold, inline code, fenced code blocks). Auto-scroll. Source citation button. Auto-growing textarea. |
| **Right — Sources** | Cited file passages from the last response. File path + line number badge + copy button. Collapses to icon rail. |

Settings drawer (gear icon): change/re-scan folder, view skipped files list.

---

## Backend Integration

All API calls are routed through `src/lib/api.js`. The current implementation is **fully local** (no backend required). When the backend is ready, update `api.js`:

### Expected endpoints

```
POST /api/scan    Body: { path: string }
                  Returns: { files: FileNode[], skipped: { path, reason }[] }

POST /api/chat    Body: { message: string, path: string }
                  Returns: { answer: string, sources: { file, line, snippet }[] }

GET  /api/status  Returns: { status: "idle" | "scanning" | "ready" }
```

The Vite dev server is pre-configured to proxy `/api/*` to `http://localhost:8000`:

```js
// vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://localhost:8000', changeOrigin: true }
  }
}
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0d0f14` | Page background |
| `--color-surface` | `#141720` | Cards, panels |
| `--color-border` | `#1e2330` | Dividers, borders |
| `--color-accent` | `#6e8efb` | Primary actions, highlights |
| `--color-accent-alt` | `#a78bfa` | Nanobot avatar, gradients |
| `--color-warning` | `#f59e0b` | Skipped/protected files |
| `--color-error` | `#ef4444` | Error states |
| `--color-success` | `#22c55e` | Completion states |
| Font | JetBrains Mono | All text |

Animations defined in `index.css`: `fade-in-up`, `pulse-glow`, `spin-slow`, `typing-dot`, `scan-pulse`, `slide-in-right/left`.

---

## File Indexing Rules

| Category | Behaviour |
|---|---|
| Text files (`.txt`, `.md`, `.py`, `.js`, `.json`, …) | Fully indexed — content searchable |
| Binary files (`.pdf`, `.png`, `.zip`, `.exe`, …) | Listed in file tree, content not indexed |
| Files > 2 MB | Listed but content skipped |
| System folders (`node_modules`, `.git`, `dist`, …) | Skipped entirely |
| Password-protected files | Listed with ⚠ warning badge |

---

## Notes for the Team

- **No `node_modules` or `dist`** — these are gitignored. Run `npm install` after cloning.
- **Browser requirement** — Chrome/Edge only for the File System Access API. If the backend later handles scanning, this restriction can be removed.
- **State is ephemeral** — the file index lives in memory. Refreshing the page starts over. Persistence can be added later via `localStorage` or IndexedDB.
- **Chat is keyword search** — until the backend AI is connected, the chat searches indexed file content directly. Answers will improve dramatically once the backend is wired in.
