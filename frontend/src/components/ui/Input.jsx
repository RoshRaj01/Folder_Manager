import React, { forwardRef } from 'react'

export const Input = forwardRef(function Input({
  value,
  onChange,
  onKeyDown,
  placeholder = '',
  disabled = false,
  id,
  type = 'text',
  label,
  hint,
  icon,
  style = {},
  ...rest
}, ref) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            left: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            color: '#e2e8f0',
            background: '#0d0f14',
            border: '1px solid #1e2330',
            borderRadius: '6px',
            padding: icon ? '10px 12px 10px 36px' : '10px 12px',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            ...style,
          }}
          className="input-glow"
          {...rest}
        />
      </div>
      {hint && (
        <span style={{ fontSize: '11px', color: '#64748b' }}>{hint}</span>
      )}
    </div>
  )
})
