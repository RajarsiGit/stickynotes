import { useEffect, useRef } from 'react'
import { NOTE_COLORS } from '../utils/colors'

export default function ColorPicker({ current, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute z-20 mt-1 flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
      style={{ width: '148px' }}
    >
      {NOTE_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.name}
          onClick={() => {
            onSelect(c.value)
            onClose()
          }}
          className={`h-6 w-6 rounded-full border ${c.value} ${
            current === c.value ? 'ring-2 ring-offset-1 ring-gray-500' : 'border-gray-300'
          }`}
        />
      ))}
    </div>
  )
}
