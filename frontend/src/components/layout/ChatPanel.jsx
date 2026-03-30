import React, { useRef, useEffect } from 'react'
import { Bot, Trash2, Sparkles } from 'lucide-react'
import { MessageBubble } from '../chat/MessageBubble'
import { ChatInput } from '../chat/ChatInput'
import { TypingIndicator } from '../chat/TypingIndicator'
import { useChat } from '../../context/ChatContext'
import { useChatActions } from '../../hooks/useChat'

export function ChatPanel() {
  const { messages, isThinking, clearChat } = useChat()
  const { send } = useChatActions()
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid #1e2330',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
          background: '#0d0f14',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(110,142,251,0.2), rgba(167,139,250,0.2))',
            border: '1px solid rgba(110,142,251,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bot size={16} color="#a78bfa" />
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>Nanobot</div>
          <div style={{ fontSize: '10px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Ready
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {messages.length > 0 && (
          <button
            id="clear-chat-btn"
            onClick={clearChat}
            title="Clear chat"
            style={{
              background: 'none',
              border: '1px solid #1e2330',
              borderRadius: '5px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '5px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2330'; e.currentTarget.style.color = '#64748b' }}
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {isThinking && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={send} disabled={isThinking} />
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="animate-fade-in"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#64748b',
        fontSize: '13px',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(110,142,251,0.15), rgba(167,139,250,0.15))',
          border: '1px solid rgba(110,142,251,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sparkles size={24} color="#6e8efb" />
      </div>
      <div>
        <div style={{ fontSize: '15px', color: '#e2e8f0', fontWeight: 600, marginBottom: '6px' }}>
          Ask Nanobot anything
        </div>
        <div style={{ maxWidth: '300px' }}>
          Search your files, summarize documents, find code patterns, or just explore what's in your folder.
        </div>
      </div>

      {/* Example prompts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', width: '100%', maxWidth: '360px' }}>
        {[
          'What documents are in this folder?',
          'Summarize the README file',
          'Find all Python files',
        ].map((prompt, i) => (
          <div
            key={i}
            style={{
              padding: '8px 12px',
              background: '#141720',
              border: '1px solid #1e2330',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#94a3b8',
              cursor: 'default',
            }}
          >
            "{prompt}"
          </div>
        ))}
      </div>
    </div>
  )
}
