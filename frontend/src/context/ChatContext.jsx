import { createContext, useContext, useReducer, useCallback } from 'react'
import { sendMessage } from '../lib/api'
import { uid, formatTimestamp } from '../lib/utils'

// ── State ──────────────────────────────────────────────
const initialState = {
  messages: [],       // { id, role: 'user'|'assistant', content, sources, timestamp }
  isThinking: false,
  activeSources: [],  // sources from last assistant message
  error: null,
}

// ── Reducer ────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }
    case 'SET_THINKING':
      return { ...state, isThinking: action.payload, error: null }
    case 'SET_ACTIVE_SOURCES':
      return { ...state, activeSources: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isThinking: false }
    case 'CLEAR':
      return { ...initialState }
    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────
const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const submitMessage = useCallback(async (text) => {
    if (!text.trim()) return

    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: uid(),
        role: 'user',
        content: text,
        timestamp: formatTimestamp(new Date()),
      },
    })
    dispatch({ type: 'SET_THINKING', payload: true })

    try {
      const response = await sendMessage(text)
      dispatch({ type: 'SET_THINKING', payload: false })
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: uid(),
          role: 'assistant',
          content: response.answer,
          sources: response.sources || [],
          timestamp: formatTimestamp(new Date()),
        },
      })
      dispatch({ type: 'SET_ACTIVE_SOURCES', payload: response.sources || [] })
      return response
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: uid(),
          role: 'assistant',
          content: `⚠️ Something went wrong: ${err.message}`,
          sources: [],
          timestamp: formatTimestamp(new Date()),
          isError: true,
        },
      })
      return null
    }
  }, [])

  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const setActiveSources = useCallback((sources) => {
    dispatch({ type: 'SET_ACTIVE_SOURCES', payload: sources })
  }, [])

  const value = {
    ...state,
    submitMessage,
    clearChat,
    setActiveSources,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
