import { useEffect, useRef, useState } from 'react'
import ColorPicker from './ColorPicker'
import LabelPicker from './LabelPicker'

export default function NoteInput({ onAdd, allLabels, onCreateLabel }) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('bg-white')
  const [labels, setLabels] = useState([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const ref = useRef(null)

  function reset() {
    setTitle('')
    setContent('')
    setColor('bg-white')
    setLabels([])
    setExpanded(false)
    setShowColorPicker(false)
    setShowLabelPicker(false)
  }

  function save() {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (trimmedTitle || trimmedContent) {
      onAdd({ title: trimmedTitle, content: trimmedContent, color, labels })
    }
    reset()
  }

  useEffect(() => {
    if (!expanded) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) save()
    }
    function handleKey(e) {
      if (e.key === 'Escape') save()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, title, content, color, labels])

  return (
    <div className="mx-auto mb-6 w-full max-w-xl" ref={ref}>
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-500 shadow-sm hover:shadow-md"
        >
          Take a note...
        </button>
      ) : (
        <div className={`rounded-lg border border-gray-300 p-3 shadow-md ${color}`}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-sm font-medium outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Take a note..."
            rows={3}
            className="mt-1 w-full resize-none bg-transparent text-sm outline-none"
          />
          {labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {labels.map((l) => (
                <span key={l} className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-gray-600">
                  {l}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <div className="relative">
                <button
                  type="button"
                  title="Change color"
                  onClick={() => setShowColorPicker((s) => !s)}
                  className="rounded-full p-1.5 text-gray-600 hover:bg-black/5"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="8.5" cy="12" r="1.2" fill="currentColor" />
                    <circle cx="15.5" cy="12" r="1.2" fill="currentColor" />
                  </svg>
                </button>
                {showColorPicker && (
                  <ColorPicker current={color} onSelect={setColor} onClose={() => setShowColorPicker(false)} />
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  title="Add label"
                  onClick={() => setShowLabelPicker((s) => !s)}
                  className="rounded-full p-1.5 text-gray-600 hover:bg-black/5"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.6 12.6L12 21.2 2.8 12 2.8 3.6 12 3.6z" strokeLinejoin="round" />
                    <circle cx="7" cy="8" r="1.2" fill="currentColor" />
                  </svg>
                </button>
                {showLabelPicker && (
                  <LabelPicker
                    allLabels={allLabels}
                    noteLabels={labels}
                    onToggle={(label) =>
                      setLabels((ls) => (ls.includes(label) ? ls.filter((l) => l !== label) : [...ls, label]))
                    }
                    onCreate={(label) => {
                      onCreateLabel(label)
                      setLabels((ls) => (ls.includes(label) ? ls : [...ls, label]))
                    }}
                    onClose={() => setShowLabelPicker(false)}
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={save}
              className="rounded px-3 py-1.5 text-sm text-gray-700 hover:bg-black/5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

