import { useCallback, useRef } from 'react'
import { getScannedData } from '../lib/api'
import { useApp } from '../context/AppContext'

/**
 * useScanner — Orchestrates the full real scan flow.
 * Drives AppContext.startScan() (which runs the FS stream),
 * then calls getScannedData() to build the tree and enter workspace.
 */
export function useScanner() {
  const { startScan, enterWorkspace, scanStatus, dispatch } = useApp()
  const cancelRef = useRef(false)

  /**
   * @param {FileSystemDirectoryHandle} dirHandle  — from pickFolder()
   */
  const scan = useCallback(async (dirHandle) => {
    cancelRef.current = false

    // This streams progress into AppContext and waits until done
    await startScan(dirHandle)

    if (!cancelRef.current) {
      // Build tree + skipped list from the in-memory index
      const { files, skipped } = getScannedData(dirHandle)
      enterWorkspace(files, skipped)
    }
  }, [startScan, enterWorkspace])

  const cancel = useCallback(() => {
    cancelRef.current = true
    dispatch({ type: 'SET_SCAN_STATUS', payload: 'cancelled' })
  }, [dispatch])

  return { scan, cancel, scanStatus }
}
