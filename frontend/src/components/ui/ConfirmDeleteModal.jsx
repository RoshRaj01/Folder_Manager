import React, { useState } from 'react'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

export function ConfirmDeleteModal({ target, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="animate-fade-in"
    >
      <div
        className="animate-fade-in-up"
        style={{
          background: '#0d0f14',
          border: '1px solid #1e2330',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '400px',
          padding: '24px',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
          }}
          title="Cancel"
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            Confirm Deletion
          </h2>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          Are you sure you want to delete <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{target}</span>? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={deleting}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              padding: '8px 16px',
              borderRadius: '6px',
              color: '#cbd5e1',
              fontSize: '13px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            style={{
              background: '#ef4444',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
            }}
          >
            {deleting ? 'Deleting...' : <><Trash2 size={14} /> Delete Forever</>}
          </button>
        </div>
      </div>
    </div>
  )
}
