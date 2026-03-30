import { useCallback, useRef } from 'react'
import { getScannedData } from '../lib/api'
import { useApp } from '../context/AppContext'

/**
 * useScanner — Orchestrates the full backend scan flow.
 *
 * 1. Calls AppContext.startScan(folderPath) which streams progress events
 *    from scanFolderStream() into the scan log UI.
 * 2. After streaming completes, calls getScannedData() (async, hits backend)
 *    to build the file tree, then transitions to the workspace.
 *
 * @param {string} folderPath — absolute OS path typed by the user
 */
export function useScanner() {
  const { startScan, enterWorkspace, scanStatus, dispatch } = useApp()
  const cancelRef = useRef(false)

  const scan = useCallback(async (folderPath) => {
    cancelRef.current = false

    // Streams progress events into AppContext (drives ScanningPage UI)
    const success = await startScan(folderPath)

    if (success && !cancelRef.current) {
      // Fetch the indexed file list from the backend and build a tree
      const { files, skipped } = await getScannedData()
      enterWorkspace(files, skipped)
    }
  }, [startScan, enterWorkspace])

  const cancel = useCallback(() => {
    cancelRef.current = true
    dispatch({ type: 'SET_SCAN_STATUS', payload: 'cancelled' })
  }, [dispatch])

  return { scan, cancel, scanStatus }
}
