import { createContext, useContext, useReducer, useCallback } from 'react'
import { scanFolderStream, getScannedData } from '../lib/api'

// ── State Shape ────────────────────────────────────────
const initialState = {
  page: 'landing',          // 'landing' | 'scanning' | 'workspace'
  folderPath: '',           // display path (folder name)
  directoryHandle: null,    // FileSystemDirectoryHandle from File System Access API
  files: [],                // file tree from scan
  skipped: [],              // password-protected files
  scanLogs: [],             // { message, progress, type }
  scanProgress: 0,
  scanStatus: 'idle',       // 'idle' | 'scanning' | 'complete' | 'cancelled'
  selectedFile: null,       // file node currently previewed
  sidebarOpen: true,
  sourcePanelOpen: true,
  settingsOpen: false,
}

// ── Reducer ────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.payload }
    case 'SET_FOLDER_PATH':
      return { ...state, folderPath: action.payload }
    case 'SET_DIRECTORY_HANDLE':
      return { ...state, directoryHandle: action.payload }
    case 'SET_FILES':
      return { ...state, files: action.payload }
    case 'SET_SKIPPED':
      return { ...state, skipped: action.payload }
    case 'ADD_SCAN_LOG':
      return {
        ...state,
        scanLogs: [...state.scanLogs, action.payload],
        scanProgress: action.payload.progress ?? state.scanProgress,
      }
    case 'SET_SCAN_STATUS':
      return { ...state, scanStatus: action.payload }
    case 'SET_SCAN_PROGRESS':
      return { ...state, scanProgress: action.payload }
    case 'CLEAR_SCAN':
      return { ...state, scanLogs: [], scanProgress: 0, scanStatus: 'idle' }
    case 'SET_SELECTED_FILE':
      return { ...state, selectedFile: action.payload }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case 'TOGGLE_SOURCE_PANEL':
      return { ...state, sourcePanelOpen: !state.sourcePanelOpen }
    case 'SET_SETTINGS_OPEN':
      return { ...state, settingsOpen: action.payload }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  /** Navigate to a page */
  const navigate = useCallback((page) => {
    dispatch({ type: 'SET_PAGE', payload: page })
  }, [])

  /**
   * Start a scan using the real FileSystemDirectoryHandle.
   * Streams progress events through the scanner generator.
   */
  const startScan = useCallback(async (dirHandle) => {
    dispatch({ type: 'SET_DIRECTORY_HANDLE', payload: dirHandle })
    dispatch({ type: 'SET_FOLDER_PATH', payload: dirHandle.name })
    dispatch({ type: 'CLEAR_SCAN' })
    dispatch({ type: 'SET_SCAN_STATUS', payload: 'scanning' })
    dispatch({ type: 'SET_PAGE', payload: 'scanning' })

    try {
      for await (const event of scanFolderStream(dirHandle)) {
        const msg = event.message || ''
        const isSkipped = msg.toLowerCase().includes('skipped') || msg.toLowerCase().includes('protecting')
        const isComplete = msg.toLowerCase().includes('complete')
        const isMuted = event.type === 'muted'

        // Don't flood logs with "muted" events — still track progress
        if (!isMuted) {
          dispatch({
            type: 'ADD_SCAN_LOG',
            payload: {
              message: msg,
              progress: event.progress,
              type: isSkipped ? 'warning' : isComplete ? 'success' : (event.type || 'info'),
              ts: Date.now(),
            },
          })
        } else {
          // Still update progress silently
          if (event.progress !== undefined) {
            dispatch({ type: 'SET_SCAN_PROGRESS', payload: event.progress })
          }
        }
      }
      dispatch({ type: 'SET_SCAN_STATUS', payload: 'complete' })
    } catch (err) {
      dispatch({
        type: 'ADD_SCAN_LOG',
        payload: { message: `Error: ${err.message}`, type: 'error', ts: Date.now() },
      })
      dispatch({ type: 'SET_SCAN_STATUS', payload: 'error' })
    }
  }, [])

  /** After scan completes, enter workspace with real file data */
  const enterWorkspace = useCallback((files, skipped) => {
    dispatch({ type: 'SET_FILES', payload: files })
    dispatch({ type: 'SET_SKIPPED', payload: skipped })
    dispatch({ type: 'SET_PAGE', payload: 'workspace' })
  }, [])

  const value = {
    ...state,
    dispatch,
    navigate,
    startScan,
    enterWorkspace,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
