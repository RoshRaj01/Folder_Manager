import { useCallback } from 'react'
import { useChat } from '../context/ChatContext'

/**
 * useChatActions — convenience wrapper for submitting messages.
 * sendMessage() in api.js now works purely off the in-memory file index,
 * so no folderPath argument is needed.
 */
export function useChatActions() {
  const { submitMessage, clearChat, messages, isThinking, activeSources } = useChat()

  const send = useCallback((text) => {
    return submitMessage(text)
  }, [submitMessage])

  return { send, clearChat, messages, isThinking, activeSources }
}
