import { useEffect, useRef, useState } from 'react'

export default function LabelPicker({ allLabels, noteLabels, onToggle, onCreate, onClose }) {
  const ref = useRef(null)
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  function submitNewLabel(e) {
    e.preventDefault()
    const trimmed = newLabel.trim()
    if (!trimmed) return
    onCreate(trimmed)
    setNewLabel('')
  }

  return (
    <div
      ref={ref}
      className="absolute z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
    >
      <p className="px-1 pb-1 text-xs font-medium text-gray-500">Label note</p>
      <div className="max-h-40 overflow-y-auto">
        {allLabels.length === 0 && (
          <p className="px-1 py-1 text-sm text-gray-400">No labels yet</p>
        )}
        {allLabels.map((label) => (
          <label
            key={label}
            className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={noteLabels.includes(label)}
              onChange={() => onToggle(label)}
            />
            <span className="truncate">{label}</span>
          </label>
        ))}
      </div>
      <form onSubmit={submitNewLabel} className="mt-1 flex items-center gap-1 border-t pt-1">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Create new label"
          className="w-full rounded px-1 py-1 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          Add
        </button>
      </form>
    </div>
  )
}
