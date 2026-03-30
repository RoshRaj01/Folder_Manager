import { createContext, useContext, useReducer, useCallback } from 'react'
import { scanFolderStream, getScannedData } from '../lib/api'

// ── State Shape ────────────────────────────────────────
const initialState = {
  page: 'landing',          // 'landing' | 'scanning' | 'workspace'
  folderPath: '',           // display path (typed by user)
  files: [],                // file tree built from backend index
  skipped: [],              // password-protected / unreadable files
  scanLogs: [],             // { message, progress, type }
  scanProgress: 0,
  scanStatus: 'idle',       // 'idle' | 'scanning' | 'complete' | 'error' | 'cancelled'
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
   * Start a backend scan for the given folder path.
   * Streams progress events from scanFolderStream() into the scan log.
   *
   * @param {string} folderPath  Absolute OS path string from user input
   */
  const startScan = useCallback(async (folderPath) => {
    dispatch({ type: 'SET_FOLDER_PATH', payload: folderPath })
    dispatch({ type: 'CLEAR_SCAN' })
    dispatch({ type: 'SET_SCAN_STATUS', payload: 'scanning' })
    dispatch({ type: 'SET_PAGE', payload: 'scanning' })

    let hadError = false

    try {
      for await (const event of scanFolderStream(folderPath)) {
        const msg = event.message || ''
        const isSkipped = msg.toLowerCase().includes('skipped') || msg.toLowerCase().includes('protecting')
        const isComplete = msg.toLowerCase().includes('complete')
        const isMuted = event.type === 'muted'

        if (event.type === 'error') {
          hadError = true
        }

        // Don't flood logs with muted events — still update progress silently
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
          if (event.progress !== undefined) {
            dispatch({ type: 'SET_SCAN_PROGRESS', payload: event.progress })
          }
        }
      }

      dispatch({ type: 'SET_SCAN_STATUS', payload: hadError ? 'error' : 'complete' })
      return !hadError;
    } catch (err) {
      dispatch({
        type: 'ADD_SCAN_LOG',
        payload: { message: `Error: ${err.message}`, type: 'error', ts: Date.now() },
      })
      dispatch({ type: 'SET_SCAN_STATUS', payload: 'error' })
      return false;
    }
  }, [])

  /** After scan completes, enter workspace with file data from backend */
  const enterWorkspace = useCallback((files, skipped) => {
    dispatch({ type: 'SET_FILES', payload: files })
    dispatch({ type: 'SET_SKIPPED', payload: skipped })
    dispatch({ type: 'SET_PAGE', payload: 'workspace' })
  }, [])

  const refreshWorkspace = useCallback(async () => {
    const { files, skipped } = await getScannedData();
    dispatch({ type: 'SET_FILES', payload: files });
    dispatch({ type: 'SET_SKIPPED', payload: skipped });
  }, [dispatch]);

  const value = {
    ...state,
    dispatch,
    navigate,
    startScan,
    enterWorkspace,
    refreshWorkspace,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
